import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Player } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';

// Errores predefinidos
const invalidCredentials = () => new AppError('Credenciales inválidas', 401);
const userNotFound      = () => new AppError('Usuario no encontrado', 404);
const badToken          = () => new AppError('Token inválido o expirado', 401);

export async function registerUser(data) {
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) return Result.err(new AppError('El usuario ya existe', 400));

  const hashed = await bcrypt.hash(data.password, 10);
  const userToCreate = {
    username: data.username,
    email: data.email,
    password: hashed,
  };

  const userRes = await Result.fromPromise(
    User.create(userToCreate),
    (e) => new AppError('No se pudo crear el usuario', 400, { cause: e })
  );
  if (userRes.isErr) return userRes;

  const playerToCreate = {
    nickname: data.username,
    avatar: data.avatar || null,
    userId: userRes.value.id,
  };

  const playerRes = await Result.fromPromise(
    Player.create(playerToCreate),
    (e) => new AppError('No se pudo crear el jugador asociado', 400, { cause: e })
  );

  if (playerRes.isErr) return playerRes;

  const token = jwt.sign({ id: userRes.value.id, email: userRes.value.email }, SECRET_KEY, { expiresIn: '2h' });

  return Result.ok({
    message: 'Usuario registrado correctamente',
    token,
    user: userRes.value.toJSON(),
    player: playerRes.value.toJSON()
  });
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email }, include: { model: Player, as: 'player' } });
  if (!user) return Result.err(invalidCredentials());

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return Result.err(invalidCredentials());

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '2h' });

  return Result.ok({
    message: 'Inicio de sesión exitoso',
    token,
    user: user.toJSON(),
    player: user.player ? user.player.toJSON() : null,
  });
}

export async function getUserProfile(token) {
  const decodedRes = Result.fromTry(
    () => jwt.verify(token, SECRET_KEY),
    () => badToken()
  );
  if (decodedRes.isErr) return decodedRes;

  const user = await User.findByPk(decodedRes.value.id, {
    include: { model: Player, as: 'player' }
  });

  if (!user) return Result.err(userNotFound());

  return Result.ok({
    user: user.toJSON(),
    player: user.player ? user.player.toJSON() : null
  });
}

export function logoutUser() {
  // El logout se maneja en el cliente (JWT expira automáticamente)
  return Result.ok({ message: 'Sesión cerrada correctamente' });
}
