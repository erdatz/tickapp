import { Server } from 'socket.io';
import * as gameService from '../services/game.service.js';
import * as moveService from '../services/move.service.js';
import * as scoreService from '../services/score.service.js';
import * as logService from '../services/log.service.js';
import Result from '../utils/result.js';

let io;

export function initSocket(server) {
  io = new Server(server, { 
    cors: { 
      origin: ['http://localhost:4200'],
      methods: ['GET', 'POST'],
      credentials: true
    } 
  });

  io.on('connection', (socket) => {
    logService.info(`🔗 Jugador conectado: ${socket.id}`);

    // Unirse al lobby global
    socket.on('joinLobby', async ({ userId, playerName }) => {
      try {
        console.log(`🏠 ${playerName} se unió al lobby`);
        socket.join('lobby');
        socket.userId = userId;
        socket.playerName = playerName;

        // ✅ CORREGIDO: Notificar actualización completa del lobby
        await notifyLobbyUpdate();

      } catch (error) {
        logService.error('❌ Error en joinLobby:', error);
      }
    });

    // Salir del lobby
    socket.on('leaveLobby', async () => {
      try {
        console.log(`👋 ${socket.playerName} salió del lobby`);
        socket.leave('lobby');
        
        // ✅ CORREGIDO: Notificar actualización completa del lobby
        await notifyLobbyUpdate();
      } catch (error) {
        logService.error('❌ Error en leaveLobby:', error);
      }
    });

    // Unirse a una sala de juego
    socket.on('joinRoom', async ({ gameId, userId, playerName }) => {
      try {
        console.log(`🎮 Jugador ${userId} intentando unirse a partida ${gameId}`);
        
        const joinRes = await gameService.joinGame(userId, gameId);
        
        if (joinRes.isErr) {
          console.error(`❌ Error uniendo jugador: ${joinRes.error.message}`);
          socket.emit('error', { message: joinRes.error.message });
          return;
        }

        socket.join(`game-${gameId}`);
        socket.gameId = gameId;
        socket.userId = userId;
        socket.playerName = playerName;

        const gameDetailRes = await gameService.getGameById(gameId);
        const playersRes = await gameService.getGamePlayers(gameId);
        
        if (!gameDetailRes.isErr) {
          socket.emit('joinSuccess', { 
            game: gameDetailRes.value,
            players: playersRes.isOk ? playersRes.value : [],
            symbol: joinRes.value.symbol 
          });

          socket.to(`game-${gameId}`).emit('playerJoined', {
            playerId: userId,
            playerName,
            players: playersRes.isOk ? playersRes.value : [],
            game: gameDetailRes.value
          });

          io.to(`game-${gameId}`).emit('gameUpdate', gameDetailRes.value);

          if (joinRes.value.gameStarted) {
            console.log(`🚀 Juego ${gameId} iniciado automáticamente`);
            io.to(`game-${gameId}`).emit('gameStarted', gameDetailRes.value);
          }

          // ✅ CORREGIDO: Notificar lobby completo
          await notifyLobbyUpdate();
        }
      } catch (error) {
        logService.error('❌ Error en joinRoom:', error);
        socket.emit('error', { message: 'Error al unirse al juego' });
      }
    });

    // Hacer un movimiento
    socket.on('makeMove', async ({ gameId, position }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Usuario no autenticado' });
          return;
        }

        console.log(`🎯 Movimiento solicitado - Juego: ${gameId}, Usuario: ${socket.userId}, Posición: ${position}`);

        const moveRes = await moveService.makeMove(gameId, socket.userId, position);
        
        if (moveRes.isErr) {
          console.error(`❌ Error en movimiento: ${moveRes.error.message}`);
          socket.emit('moveError', { 
            message: moveRes.error.message,
            position: position 
          });
          return;
        }

        console.log(`✅ Movimiento exitoso - Estado: ${moveRes.value.gameStatus}`);

        const gameDetailRes = await gameService.getGameById(gameId);
        const historyRes = await gameService.getGameHistory(gameId);

        if (!gameDetailRes.isErr) {
          const eventData = {
            game: gameDetailRes.value,
            move: moveRes.value,
            history: historyRes.isOk ? historyRes.value : [],
            winningLine: moveRes.value.winningLine || null,
            isGameFinished: moveRes.value.gameStatus === 'finished'
          };

          console.log(`📢 Emitiendo moveMade para juego ${gameId} - Estado: ${gameDetailRes.value.status}`);

          io.to(`game-${gameId}`).emit('moveMade', eventData);

          if (moveRes.value.gameStatus === 'finished') {
            console.log(`🏁 Juego ${gameId} terminado - emitiendo gameFinished`);
            
            let winnerInfo = null;
            if (moveRes.value.winnerId) {
              const winnerPlayer = await gameService.getGamePlayers(gameId);
              if (winnerPlayer.isOk) {
                const winner = winnerPlayer.value.find(p => p.id === moveRes.value.winnerId);
                winnerInfo = winner;
              }
            }

            io.to(`game-${gameId}`).emit('gameFinished', {
              game: gameDetailRes.value,
              winnerId: moveRes.value.winnerId,
              isDraw: moveRes.value.isDraw,
              winningLine: moveRes.value.winningLine || null,
              winnerInfo: winnerInfo,
              finalMessage: moveRes.value.message
            });

            // ✅ CORREGIDO: Notificar lobby completo y actualizar ranking
            await notifyLobbyUpdate();
            await notifyRankingUpdate();
          }
        }
      } catch (error) {
        console.error('❌ Error en makeMove:', error);
        socket.emit('moveError', { 
          message: 'Error al realizar movimiento',
          position: position 
        });
      }
    });

    // ✅ CORREGIDO: Crear nueva partida - solo una creación
    socket.on('createGame', async ({ title, maxPlayers, userId }) => {
      try {
        console.log(`🆕 Creando nueva partida: "${title}" por usuario ${userId}`);
        
        const gameRes = await gameService.createGame({ title, maxPlayers });
        
        if (gameRes.isErr) {
          socket.emit('error', { message: gameRes.error.message });
          return;
        }

        const game = gameRes.value;
        console.log(`✅ Partida creada: ${game.id}`);

        // ✅ SOLUCIÓN: Emitir solo al creador y notificar lobby completo
        socket.emit('gameCreated', { game });
        await notifyLobbyUpdate();

      } catch (error) {
        console.error('❌ Error en createGame:', error);
        socket.emit('error', { message: 'Error al crear partida' });
      }
    });

    // Iniciar juego manualmente
    socket.on('startGame', async ({ gameId }) => {
      try {
        const startRes = await gameService.startGame(gameId);
        
        if (startRes.isErr) {
          socket.emit('error', { message: startRes.error.message });
          return;
        }

        const gameDetailRes = await gameService.getGameById(gameId);
        if (!gameDetailRes.isErr) {
          io.to(`game-${gameId}`).emit('gameStarted', gameDetailRes.value);
          io.to(`game-${gameId}`).emit('gameUpdate', gameDetailRes.value);

          await notifyLobbyUpdate();
        }
      } catch (error) {
        logService.error('Error en startGame:', error);
        socket.emit('error', { message: 'Error al iniciar juego' });
      }
    });

    // Abandonar juego
    socket.on('leaveRoom', async (gameId) => {
      try {
        console.log(`👋 Jugador ${socket.userId} abandonando partida ${gameId}`);
        socket.leave(`game-${gameId}`);
        
        socket.to(`game-${gameId}`).emit('playerLeft', {
          playerId: socket.userId,
          playerName: socket.playerName
        });

        await notifyLobbyUpdate();

      } catch (error) {
        logService.error('Error en leaveRoom:', error);
      }
    });

    // ✅ NUEVO: Solicitar jugadores en línea
    socket.on('getOnlinePlayers', async () => {
      try {
        const onlinePlayers = await getOnlinePlayers();
        socket.emit('onlinePlayersUpdate', onlinePlayers);
      } catch (error) {
        console.error('❌ Error obteniendo jugadores en línea:', error);
      }
    });

    // ✅ NUEVO: Solicitar ranking actualizado
    socket.on('getRankingUpdate', async () => {
      try {
        await notifyRankingUpdate();
      } catch (error) {
        console.error('❌ Error obteniendo ranking:', error);
      }
    });

    // Chat en el juego
    socket.on('gameChat', ({ gameId, message }) => {
      socket.to(`game-${gameId}`).emit('gameChat', {
        playerId: socket.userId,
        playerName: socket.playerName,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Desconexión
    socket.on('disconnect', async () => {
      logService.info(`🔌 Jugador desconectado: ${socket.id}`);
      
      // ✅ CORREGIDO: Notificar actualización completa del lobby
      await notifyLobbyUpdate();
    });
  });
}

// ✅ CORREGIDO: Función para notificar actualización completa del lobby
async function notifyLobbyUpdate() {
  try {
    // Obtener todas las partidas
    const gamesRes = await gameService.listGames();
    if (gamesRes.isErr) return;

    const games = gamesRes.value;
    
    // Obtener jugadores en línea
    const onlinePlayers = await getOnlinePlayers();
    
    // Preparar datos simplificados de partidas para el lobby
    const lobbyGames = games.map(game => ({
      id: game.id,
      title: game.title,
      status: game.status,
      maxPlayers: game.maxPlayers,
      playersCount: game.players ? game.players.length : 0,
      createdAt: game.createdAt
    }));

    // Emitir actualización completa del lobby
    io.to('lobby').emit('lobbyUpdate', {
      games: lobbyGames,
      onlinePlayers,
      timestamp: new Date().toISOString()
    });

    console.log(`🔄 Lobby actualizado - Partidas: ${lobbyGames.length}, Jugadores: ${onlinePlayers.length}`);
  } catch (error) {
    console.error('❌ Error notificando lobby:', error);
  }
}

// ✅ CORREGIDO: Obtener jugadores en línea desde sockets conectados
async function getOnlinePlayers() {
  try {
    const sockets = await io.in('lobby').fetchSockets();
    const onlinePlayers = sockets.map(socket => ({
      id: socket.userId,
      name: socket.playerName,
      status: 'online',
      lastActivity: new Date().toISOString(),
      socketId: socket.id
    }));

    // Eliminar duplicados por userId
    const uniquePlayers = onlinePlayers.filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    );

    return uniquePlayers;
  } catch (error) {
    console.error('❌ Error obteniendo jugadores en línea:', error);
    return [];
  }
}

// ✅ NUEVO: Notificar actualización de ranking
async function notifyRankingUpdate() {
  try {
    const ranking = await scoreService.getRanking();
    io.to('lobby').emit('rankingUpdate', ranking);
    console.log('📊 Ranking actualizado enviado al lobby');
  } catch (error) {
    console.error('❌ Error notificando ranking:', error);
  }
}

export function emitToRoom(roomId, event, data) {
  if (!io) throw new Error('Socket.io no inicializado');
  io.to(`game-${roomId}`).emit(event, data);
}

export function emitToPlayer(socketId, event, data) {
  if (!io) throw new Error('Socket.io no inicializado');
  io.to(socketId).emit(event, data);
}

export function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}