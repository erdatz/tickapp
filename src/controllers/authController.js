import * as authService from '../services/auth.service.js';

export async function registerUser(req, res, next) {
  const result = await authService.registerUser(req.body);
  if (result.isErr) return next(result.error);
  res.status(201).json(result.value);
}

export async function loginUser(req, res, next) {
  const result = await authService.loginUser(req.body);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export async function getUserProfile(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next({ status: 401, message: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  const result = await authService.getUserProfile(token);
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}

export function logoutUser(req, res, next) {
  const result = authService.logoutUser();
  if (result.isErr) return next(result.error);
  res.status(200).json(result.value);
}
