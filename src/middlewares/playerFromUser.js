import Player from '../models/Player.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

export default async function playerFromUser(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return next(new AppError('Usuario no autenticado', 401));

  const playerRes = await Result.fromPromise(
    Player.findOne({ where: { userId } }),
    (e) => new AppError('Error al buscar el jugador', 500, { cause: e })
  );

  if (playerRes.isErr) return next(playerRes.error);

  const player = playerRes.value;
  if (!player) return next(new AppError('No se encontró el jugador asociado al usuario', 404));

  req.player = player;
  next();
}