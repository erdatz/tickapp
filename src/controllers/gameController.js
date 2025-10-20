import * as gameService from '../services/game.service.js';
import * as moveService from '../services/move.service.js';
import * as scoreService from '../services/score.service.js';

// CRUD
export async function listGames(req, res, next) {
  const result = await gameService.listGames();
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function createGame(req, res, next) {
  const result = await gameService.createGame(req.body);
  if (result.isErr) return next(result.error);
  res.status(201).json(result.value);
}

export async function getGameById(req, res, next) {
  const result = await gameService.getGameById(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function updateGame(req, res, next) {
  const result = await gameService.updateGame(req.params.id, req.body);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function deleteGame(req, res, next) {
  const result = await gameService.deleteGame(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(204).end();
}

// Unión / Ready
export async function joinGame(req, res, next) {
  const userId = req.user.id;
  const { gameId } = req.body;
  const result = await gameService.joinGame(userId, gameId);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function leaveGame(req, res, next) {
  const userId = req.user.id;
  const { gameId } = req.body;
  const result = await gameService.leaveGame(userId, gameId);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

// Inicio / fin partida
export async function startGame(req, res, next) {
  const { gameId } = req.body;
  const result = await gameService.startGame(gameId);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function endGame(req, res, next) {
  const { gameId, winnerId } = req.body;
  const result = await gameService.endGame(gameId, winnerId);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

// Movimientos
export async function makeMoveController(req, res, next) {
  const userId = req.user.id;
  const { gameId, position } = req.body;
  const result = await moveService.makeMove(gameId, userId, position);
  if (result.isErr) return next(result.error);
  res.status(201).json(result.value);
}

export async function getMovesByGame(req, res, next) {
  const { gameId } = req.params;
  const result = await moveService.getMovesByGame(gameId);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

// Información adicional
export async function getGamePlayers(req, res, next) {
  const result = await gameService.getGamePlayers(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function getGameState(req, res, next) {
  const result = await gameService.getGameState(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function getGameScores(req, res, next) {
  const result = await scoreService.getScoresByGame(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function getGameHistoryController(req, res, next) {
  const result = await gameService.getGameHistory(req.params.id);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

// Ranking global
export async function getRankingController(req, res, next) {
  try {
    const ranking = await scoreService.getRanking();
    res.status(200).json(ranking);
  } catch (error) {
    next(new Error('Error obteniendo ranking global: ' + error.message));
  }
}
