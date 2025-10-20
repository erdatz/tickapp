import * as playerService from '../services/player.service.js';

export async function createPlayer(req, res, next) {
  const result = await playerService.createPlayer(req.body);
  if (result.isErr) return next(result.error);

  res.status(201).json(result.value.toJSON());
}

export async function getPlayerById(req, res, next) {
  const result = await playerService.getPlayerById(req.params.id);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function updatePlayer(req, res, next) {
  const result = await playerService.updatePlayer(req.params.id, req.body);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function patchPlayer(req, res, next) {
  const result = await playerService.patchPlayer(req.params.id, req.body);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function deletePlayer(req, res, next) {
  const result = await playerService.deletePlayer(req.params.id);
  if (result.isErr) return next(result.error);
  
  res.status(204).end();
}