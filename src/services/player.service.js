import { Player, User, Score, GamePlayer, Game } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

const playerNotFound = () => new AppError('Jugador no encontrado', 404);

/* =========================
   CRUD Básico de Player
   ========================= */

export async function createPlayer(data) {
  return Result.fromPromise(
    Player.create(data),
    (e) => new AppError('Error creando jugador', 500, { cause: e })
  );
}

export async function getPlayerById(id) {
  const res = await Result.fromPromise(
    Player.findByPk(id, { include: { model: User, as: 'user' } }),
    (e) => new AppError('Error obteniendo jugador', 500, { cause: e })
  );
  if (res.isErr) return res;
  if (!res.value) return Result.err(playerNotFound());
  return Result.ok(res.value);
}

export async function updatePlayer(id, data) {
  const playerRes = await getPlayerById(id);
  if (playerRes.isErr) return playerRes;

  return Result.fromPromise(
    playerRes.value.update(data),
    (e) => new AppError('Error actualizando jugador', 500, { cause: e })
  );
}

export async function patchPlayer(id, patch) {
  return updatePlayer(id, patch);
}

export async function deletePlayer(id) {
  const playerRes = await getPlayerById(id);
  if (playerRes.isErr) return playerRes;

  return Result.fromPromise(
    playerRes.value.destroy().then(() => null),
    (e) => new AppError('Error eliminando jugador', 500, { cause: e })
  );
}

/* =========================
   Funciones adicionales
   ========================= */

// Obtener jugadores conectados / en línea
export async function listPlayers() {
  const players = await Player.findAll({
    include: { model: User, as: 'user' }
  });
  return players.map(p => ({
    id: p.id,
    name: p.name,
    email: p.email,
    userId: p.userId,
  }));
}

// Ranking de jugadores por partidas ganadas
export async function getPlayerRanking(limit = 10) {
  // Contar victorias de cada jugador
  const scores = await Score.findAll({
    include: { model: Player, as: 'player' }
  });

  const rankingMap = {};
  scores.forEach(score => {
    const playerId = score.playerId;
    if (!rankingMap[playerId]) rankingMap[playerId] = { player: score.player.name, wins: 0, draws: 0 };
    if (score.score === 1) rankingMap[playerId].wins += 1;
    if (score.score === 0) rankingMap[playerId].draws += 1;
  });

  const ranking = Object.values(rankingMap)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, limit);

  return ranking;
}

// Obtener todas las partidas de un jugador
export async function getPlayerGames(playerId) {
  const player = await Player.findByPk(playerId, {
    include: { model: Game, as: 'games' }
  });
  if (!player) return Result.err(playerNotFound());
  return player.games;
}
