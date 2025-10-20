import jwt from 'jsonwebtoken';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return next(new AppError('Token no proporcionado', 401));

  const token = authHeader.split(' ')[1];
  const verified = Result.fromTry(
    () => jwt.verify(token, process.env.JWT_SECRET),
    () => new AppError('Token inválido o expirado', 403)
  );

  if (verified.isErr) return next(verified.error);

  req.user = verified.value;
  next();
}
