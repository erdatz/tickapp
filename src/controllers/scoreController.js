import * as scoreService from '../services/score.service.js';

export async function createScore(req, res, next) {
  const result = await scoreService.createScore(req.body);
  if (result.isErr) return next(result.error);

  res.status(201).json(result.value.toJSON());
}

export async function getScoreById(req, res, next) {
  const result = await scoreService.getScoreById(req.params.id);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function updateScore(req, res, next) {
  const result = await scoreService.updateScore(req.params.id, req.body);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function patchScore(req, res, next) {
  const result = await scoreService.patchScore(req.params.id, req.body);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value.toJSON());
}

export async function deleteScore(req, res, next) {
  const result = await scoreService.deleteScore(req.params.id);
  if (result.isErr) return next(result.error);

  res.status(204).end();
}