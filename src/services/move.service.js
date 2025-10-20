import { Move, Player, GamePlayer, Game } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';
import * as gameService from './game.service.js';
import * as scoreService from './score.service.js';
import { Op } from 'sequelize';

export async function makeMove(gameId, userId, position) {
  try {
    console.log(`🔹 Procesando movimiento: juego=${gameId}, usuario=${userId}, posición=${position}`);
    
    // Obtener el juego con todas las relaciones necesarias
    const gameRes = await gameService.getGameById(gameId);
    if (gameRes.isErr) return gameRes;
    const game = gameRes.value;

    console.log(`🔹 Estado actual del juego: ${game.status}`);

    // Si el juego ya está terminado, permitir ver el resultado pero no hacer movimientos
    if (game.status === 'finished') {
      return Result.err(new AppError('La partida ya ha terminado', 400));
    }

    if (game.status !== 'active') {
      return Result.err(new AppError('La partida no está activa', 400));
    }

    const player = await Player.findOne({ where: { userId } });
    if (!player) return Result.err(new AppError('Jugador no encontrado', 404));

    const gamePlayer = await GamePlayer.findOne({ 
      where: { gameId, playerId: player.id } 
    });
    if (!gamePlayer) 
      return Result.err(new AppError('Jugador no pertenece a esta partida', 400));

    if (game.currentPlayerId !== player.id) {
      return Result.err(new AppError('No es tu turno', 400));
    }

    // Validar y preparar el tablero
    const board = Array.isArray(game.boardState) ? [...game.boardState] : Array(9).fill(null);
    if (position < 0 || position > 8 || board[position] !== null) {
      return Result.err(new AppError('Movimiento inválido', 400));
    }

    // Realizar el movimiento
    const symbol = gamePlayer.symbol;
    board[position] = symbol;
    const moveNumber = (game.turnCount || 0) + 1;

    console.log(`🔹 Movimiento realizado: ${symbol} en posición ${position}, movimiento #${moveNumber}`);

    // Verificar condiciones de victoria/empate ANTES de crear el movimiento
    const winResult = await checkWinCondition(board, gameId);
    const winnerId = winResult.winnerId;
    const isDraw = moveNumber === 9 && !winnerId;
    
    console.log(`🔹 Resultado verificación: Ganador=${winnerId}, Empate=${isDraw}`);

    let newStatus = game.status;
    let nextPlayerId = null;

    if (winnerId || isDraw) {
      newStatus = 'finished';
      console.log(`🎯 JUEGO TERMINADO - Ganador: ${winnerId}, Empate: ${isDraw}`);
    } else {
      // Determinar siguiente jugador solo si el juego no ha terminado
      const players = await GamePlayer.findAll({ 
        where: { gameId },
        order: [['symbol', 'ASC']]
      });
      
      const currentPlayerIndex = players.findIndex(p => p.playerId === player.id);
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      nextPlayerId = players[nextPlayerIndex]?.playerId || null;
      console.log(`🔹 Siguiente jugador: ${nextPlayerId}`);
    }

    // Crear registro del movimiento - SOLO si todo está válido
    const moveRes = await Result.fromPromise(
      Move.create({ 
        gameId, 
        playerId: player.id, 
        position, 
        symbol, 
        moveNumber 
      }),
      (e) => new AppError('Error creando movimiento', 500, { cause: e })
    );
    if (moveRes.isErr) return moveRes;

    // Actualizar turnos de los jugadores
    await GamePlayer.update({ isTurn: false }, { where: { gameId } });
    if (nextPlayerId && !winnerId && !isDraw) {
      await GamePlayer.update({ isTurn: true }, { 
        where: { gameId, playerId: nextPlayerId } 
      });
    }

    // Actualizar el juego
    const updateData = {
      boardState: board,
      turnCount: moveNumber,
      currentPlayerId: nextPlayerId,
      status: newStatus
    };

    if (winnerId) {
      updateData.winnerId = winnerId;
    }

    console.log(`🔹 Actualizando juego con datos:`, updateData);
    await game.update(updateData);

    // Finalizar juego si es necesario (para puntuaciones)
    if (winnerId || isDraw) {
      console.log(`🏁 Finalizando juego ${gameId} - Ganador: ${winnerId}, Empate: ${isDraw}`);
      try {
        await scoreService.endGame(gameId, winnerId, isDraw);
        console.log(`✅ Puntuaciones actualizadas correctamente`);
      } catch (scoreError) {
        console.error('❌ Error actualizando puntuaciones:', scoreError);
        // No fallar el movimiento por error en puntuaciones
      }
    }

    const moveData = moveRes.value?.get ? moveRes.value.get({ plain: true }) : moveRes.value;

    // Preparar mensaje para el frontend
    let message = 'Movimiento realizado correctamente';
    if (winnerId) {
      const winnerPlayer = await Player.findByPk(winnerId);
      const winnerName = winnerPlayer?.nickname || 'Jugador';
      message = `¡${winnerName} ha ganado la partida!`;
    } else if (isDraw) {
      message = '¡Empate!';
    }

    console.log(`✅ Movimiento completado exitosamente - Estado: ${newStatus}`);

    return Result.ok({
      message: message,
      board,
      nextPlayerId,
      winnerId,
      isDraw,
      move: moveData,
      winningLine: winResult.winningLine,
      gameStatus: newStatus // Incluir el nuevo estado en la respuesta
    });

  } catch (error) {
    console.error('❌ Error en makeMove:', error);
    return Result.err(new AppError('Error al realizar movimiento', 500, { cause: error }));
  }
}

export async function checkWinCondition(board, gameId) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8], // Filas
    [0,3,6],[1,4,7],[2,5,8], // Columnas
    [0,4,8],[2,4,6]          // Diagonales
  ];
  
  for (const combo of winCombos) {
    const [a, b, c] = combo;
    // Verificar que las posiciones no sean null y sean iguales
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      console.log(`🎯 ¡Victoria detectada! Línea: ${combo}, Símbolo: ${board[a]}`);
      
      // Buscar al jugador ganador por el símbolo
      const winningSymbol = board[a];
      const winnerPlayer = await GamePlayer.findOne({
        where: { 
          gameId, 
          symbol: winningSymbol 
        }
      });
      
      return {
        winnerId: winnerPlayer?.playerId || null,
        winningLine: combo
      };
    }
  }
  
  return { winnerId: null, winningLine: null };
}

export async function getMovesByGame(gameId) {
  return Result.fromPromise(
    Move.findAll({ 
      where: { gameId }, 
      order: [['moveNumber', 'ASC']],
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'nickname']
        }
      ]
    }),
    (e) => new AppError('Error obteniendo movimientos', 500, { cause: e })
  );
}

export async function getGameHistory(gameId) {
  const movesRes = await getMovesByGame(gameId);
  if (movesRes.isErr) return movesRes;

  const history = movesRes.value.map(move => ({
    moveNumber: move.moveNumber,
    symbol: move.symbol,
    position: move.position,
    playerName: move.player?.nickname || 'Desconocido',
    playerId: move.playerId
  }));

  return Result.ok(history);
}

export function validateMove(board, position) {
  if (position < 0 || position > 8) {
    return { isValid: false, message: 'Posición fuera de rango' };
  }
  
  if (board[position] !== null) {
    return { isValid: false, message: 'Casilla ya ocupada' };
  }
  
  return { isValid: true, message: 'Movimiento válido' };
}