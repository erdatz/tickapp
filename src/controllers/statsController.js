import * as statsService from '../services/stat.service.js';

export async function getRequestStats(req, res) {
  const stats = await statsService.fetchAllStats();
  const result = await statsService.calculateRequestStats(stats);
  res.json(result);
}

export async function getResponseTimes(req, res) {
  const stats = await statsService.fetchAllStats();
  const result = await statsService.calculateResponseTimes(stats);
  res.json(result);
}

export async function getStatusCodes(req, res) {
  const stats = await statsService.fetchAllStats();
  const result = await statsService.calculateStatusCodes(stats);
  res.json(result);
}

export async function getPopularEndpoints(req, res) {
  const stats = await statsService.fetchAllStats();
  const result = await statsService.calculatePopularEndpoints(stats);
  res.json(result);
}
