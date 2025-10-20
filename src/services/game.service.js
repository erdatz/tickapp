import { Game, Player, GamePlayer, Move } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';
import * as scoreService from './score.service.js';

const gameNotFound = () => new AppError('Partida no encontrada', 404);
const playerNotFound = () => new AppError('Jugador no encontrado', 404);

export async function createGame(data) {
  const gameRes = await Result.fromPromise(
    Game.create(data),
    (e) => new AppError('Error creando partida', 500, { cause: e })
  );
  if (gameRes.isErr) return gameRes;
  return Result.ok(gameRes.value);
}

export async function getGameById(id) {
  const res = await Result.fromPromise(
    Game.findByPk(id, {
      include: [
        { 
          model: Player, 
          as: 'players',
          attributes: ['id', 'nickname', 'avatar']
        },
        { model: Move, as: 'moves' },
        { 
          model: GamePlayer, 
          as: 'gamePlayers', 
          include: [{ 
            model: Player, 
            as: 'player',
            attributes: ['id', 'nickname', 'avatar']
          }] 
        }
      ]
    }),
    (e) => new AppError('Error obteniendo partida', 500, { cause: e })
  );
  if (res.isErr) return res;
  if (!res.value) return Result.err(gameNotFound());
  return Result.ok(res.value);
}

export async function updateGame(id, data) {
  const gameRes = await getGameById(id);
  if (gameRes.isErr) return gameRes;
  return Result.fromPromise(
    gameRes.value.update(data),
    (e) => new AppError('Error actualizando partida', 500, { cause: e })
  );
}

export async function deleteGame(id) {
  const gameRes = await getGameById(id);
  if (gameRes.isErr) return gameRes;
  return Result.fromPromise(
    gameRes.value.destroy().then(() => null),
    (e) => new AppError('Error eliminando partida', 500, { cause: e })
  );
}

export async function listGames() {
  const gamesRes = await Result.fromPromise(
    Game.findAll({
      include: [
        { 
          model: Player, 
          as: 'players',
          attributes: ['id', 'nickname', 'avatar']
        },
        { model: Move, as: 'moves' },
        { 
          model: GamePlayer, 
          as: 'gamePlayers', 
          include: [{ 
            model: Player, 
            as: 'player',
            attributes: ['id', 'nickname', 'avatar']
          }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    }),
    (e) => new AppError('Error obteniendo lista de partidas', 500, { cause: e })
  );
  if (gamesRes.isErr) return gamesRes;
  return Result.ok(gamesRes.value);
}

export async function joinGame(userId, gameId) {
  const gameRes = await getGameById(gameId);
  if (gameRes.isErr) return gameRes;
  const game = gameRes.value;

  const player = await Player.findOne({ where: { userId } });
  if (!player) return Result.err(playerNotFound());

  const existing = await GamePlayer.findOne({ where: { gameId, playerId: player.id } });
  if (existing)
    return Result.ok({ message: 'Jugador ya está en la partida', symbol: existing.symbol });

  if (game.status !== 'waiting')
    return Result.err(new AppError('No se puede unir a partida activa o finalizada', 400));

  const currentPlayers = await GamePlayer.count({ where: { gameId } });
  if (currentPlayers >= game.maxPlayers)
    return Result.err(new AppError('La partida ya está llena', 400));

  const symbol = currentPlayers === 0 ? 'X' : 'O';

  await GamePlayer.create({
    gameId,
    playerId: player.id,
    symbol,
    isTurn: symbol === 'X'
  });

  const totalPlayers = await GamePlayer.count({ where: { gameId } });
  if (totalPlayers === game.maxPlayers) {
    await startGame(gameId);
  }

  return Result.ok({
    message: 'Jugador unido correctamente a la partida',
    gameId,
    playerId: player.id,
    symbol,
    gameStarted: totalPlayers === game.maxPlayers
  });
}

export async function startGame(gameId) {
  const gameRes = await getGameById(gameId);
  if (gameRes.isErr) return gameRes;
  const game = gameRes.value;

  const gamePlayers = await GamePlayer.findAll({
    where: { gameId },
    include: [{ 
      model: Player, 
      as: 'player',
      attributes: ['id', 'nickname', 'avatar']
    }]
  });

  if (gamePlayers.length < 2)
    return Result.err(new AppError('No hay suficientes jugadores para iniciar la partida', 400));

  const firstPlayer = gamePlayers.find((p) => p.symbol === 'X');
  if (!firstPlayer)
    return Result.err(new AppError('No se pudo determinar el primer jugador', 400));

  await game.update({
    status: 'active',
    currentPlayerId: firstPlayer.playerId
  });

  await GamePlayer.update({ isTurn: false }, { where: { gameId } });
  await GamePlayer.update({ isTurn: true }, { where: { gameId, playerId: firstPlayer.playerId } });

  return Result.ok({
    message: 'Partida iniciada correctamente',
    gameId,
    firstPlayerId: firstPlayer.playerId
  });
}

export async function endGame(gameId, winnerId = null, isDraw = false) {
  const gameRes = await getGameById(gameId);
  if (gameRes.isErr) return gameRes;
  const game = gameRes.value;

  // Actualizar estado del juego
  await game.update({ status: 'finished', winnerId });

  // Obtener todos los jugadores de la partida
  const playersInGame = await GamePlayer.findAll({ 
    where: { gameId },
    include: [{ model: Player, as: 'player' }]
  });

  console.log(`🎯 Finalizando juego ${gameId} - Jugadores: ${playersInGame.length}, Ganador: ${winnerId}, Empate: ${isDraw}`);

  // Asignar scores según el resultado
  if (isDraw) {
    console.log(`🤝 Empate - Asignando 500 puntos a cada jugador`);
    for (const gp of playersInGame) {
      await scoreService.addScore(gp.playerId, gameId, 500, 'draw');
      console.log(`✅ Score asignado a ${gp.player.nickname}: 500 puntos (draw)`);
    }
  } else if (winnerId) {
    console.log(`🏆 Hay ganador - Asignando scores`);
    for (const gp of playersInGame) {
      if (gp.playerId === winnerId) {
        await scoreService.addScore(gp.playerId, gameId, 1000, 'win');
        console.log(`✅ Score asignado a ${gp.player.nickname}: 1000 puntos (win)`);
      } else {
        await scoreService.addScore(gp.playerId, gameId, 0, 'loss');
        console.log(`✅ Score asignado a ${gp.player.nickname}: 0 puntos (loss)`);
      }
    }
  } else {
    console.log(`⚠️ No hay ganador ni empate - Asignando scores por abandono`);
    for (const gp of playersInGame) {
      await scoreService.addScore(gp.playerId, gameId, 100, 'draw'); // Puntos mínimos por participación
      console.log(`✅ Score asignado a ${gp.player.nickname}: 100 puntos (participación)`);
    }
  }

  console.log(`✅ Juego ${gameId} finalizado correctamente`);
  return Result.ok({ message: 'Partida finalizada', gameId, winnerId });
}


/* =======================================
   🔹 Obtener jugadores de una partida - MEJORADO
   ======================================= */
export async function getGamePlayers(gameId) {
  const res = await Result.fromPromise(
    GamePlayer.findAll({
      where: { gameId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'nickname', 'avatar', 'userId']
        }
      ],
      order: [['symbol', 'ASC']]
    }),
    (e) => new AppError('Error obteniendo jugadores de la partida', 500, { cause: e })
  );

  if (res.isErr) return res;
  
  const players = res.value.map(gp => ({
    id: gp.player.id,
    nickname: gp.player.nickname,
    avatar: gp.player.avatar,
    userId: gp.player.userId,
    symbol: gp.symbol,
    isTurn: gp.isTurn,
    joinedAt: gp.joinedAt
  }));

  return Result.ok(players);
}

/* =======================================
   🔹 Estado actual del juego
   ======================================= */
export async function getGameState(gameId) {
  const res = await Result.fromPromise(
    Game.findByPk(gameId, {
      include: [
        {
          model: Player,
          as: 'players',
          attributes: ['id', 'nickname']
        }
      ]
    }),
    (e) => new AppError('Error obteniendo estado del juego', 500, { cause: e })
  );

  if (res.isErr) return res;
  if (!res.value) return Result.err(new AppError('Partida no encontrada', 404));

  const game = res.value;
  return Result.ok({
    id: game.id,
    title: game.title,
    boardState: game.boardState,
    status: game.status,
    turnCount: game.turnCount,
    currentPlayerId: game.currentPlayerId,
    winnerId: game.winnerId,
    players: game.players || []
  });
}

/* =======================================
   🔹 Historial de movimientos
   ======================================= */
export async function getGameHistory(gameId) {
  const res = await Result.fromPromise(
    Move.findAll({
      where: { gameId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'nickname']
        }
      ],
      order: [['moveNumber', 'ASC']]
    }),
    (e) => new AppError('Error obteniendo historial del juego', 500, { cause: e })
  );

  if (res.isErr) return res;
  const history = res.value.map(m => ({
    moveNumber: m.moveNumber,
    symbol: m.symbol,
    position: m.position,
    playerName: m.player?.nickname || 'Desconocido',
    playerId: m.player?.id
  }));

  return Result.ok(history);
}