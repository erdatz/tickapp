import { GameInvitation, Player, Game } from '../models/index.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';
import * as gameService from './game.service.js';

/* =======================================
   🔹 Enviar invitación
   ======================================= */
export async function sendInvitation(senderUserId, receiverUserId) {
  // Buscar Player asociado a cada User
  const sender = await Player.findOne({ where: { userId: senderUserId } });
  const receiver = await Player.findOne({ where: { userId: receiverUserId } });
  if (!sender || !receiver)
    return Result.err(new AppError('Jugador no encontrado', 404));

  // Verificar invitación pendiente
  const existing = await GameInvitation.findOne({
    where: { senderId: sender.id, receiverId: receiver.id, status: 'pending' }
  });
  if (existing)
    return Result.err(new AppError('Ya existe una invitación pendiente', 400));

  // Crear invitación
  return Result.fromPromise(
    GameInvitation.create({ senderId: sender.id, receiverId: receiver.id }),
    (e) => new AppError('Error creando invitación', 500, { cause: e })
  );
}

/* =======================================
   🔹 Aceptar invitación
   ======================================= */
   export async function acceptInvitation(receiverUserId, invitationId) {
    // Obtener Player del receptor
    const receiver = await Player.findOne({ where: { userId: receiverUserId } });
    if (!receiver) return Result.err(new AppError('Jugador no encontrado', 404));
    const receiverPlayerId = receiver.id;
  
    // Obtener invitación
    const invitation = await GameInvitation.findByPk(invitationId);
    if (!invitation) return Result.err(new AppError('Invitación no encontrada', 404));
    if (invitation.receiverId !== receiverPlayerId)
      return Result.err(new AppError('No puedes aceptar esta invitación', 403));
  
    // Crear partida
    const gameRes = await gameService.createGame({
      title: `Partida de ${invitation.senderId} vs ${invitation.receiverId}`,
      maxPlayers: 2
    });
    if (gameRes.isErr) return Result.err(gameRes.error);
    const gameId = gameRes.value.id;
  
    // Obtener sender para su userId
    const sender = await Player.findOne({ where: { id: invitation.senderId } });
    if (!sender) return Result.err(new AppError('Jugador remitente no encontrado', 404));
    const senderUserId = sender.userId;
  
    // Unir jugadores a la partida
    const joinSender = await gameService.joinGame(senderUserId, gameId);
    if (joinSender.isErr) return Result.err(joinSender.error);
  
    const joinReceiver = await gameService.joinGame(receiverUserId, gameId);
    if (joinReceiver.isErr) return Result.err(joinReceiver.error);
  
    // Actualizar invitación
    invitation.status = 'accepted';
    invitation.gameId = gameId;
    await invitation.save();
  
    return Result.ok({
      message: 'Invitación aceptada, partida creada y jugadores unidos',
      invitation,
      game: gameRes.value
    });
  }

/* =======================================
   🔹 Rechazar invitación
   ======================================= */
export async function rejectInvitation(receiverUserId, invitationId) {
  const receiver = await Player.findOne({ where: { userId: receiverUserId } });
  if (!receiver) return Result.err(new AppError('Jugador no encontrado', 404));

  const invitation = await GameInvitation.findByPk(invitationId);
  if (!invitation) return Result.err(new AppError('Invitación no encontrada', 404));
  if (invitation.receiverId !== receiver.id)
    return Result.err(new AppError('No puedes rechazar esta invitación', 403));

  invitation.status = 'rejected';
  await invitation.save();

  return Result.ok({ message: 'Invitación rechazada', invitation });
}

/* =======================================
   🔹 Listar invitaciones recibidas
   ======================================= */
export async function getReceivedInvitations(userId) {
  const player = await Player.findOne({ where: { userId } });
  if (!player) return Result.err(new AppError('Jugador no encontrado', 404));

  const invitations = await GameInvitation.findAll({
    where: { receiverId: player.id },
    include: [
      { model: Player, as: 'sender', attributes: ['id', 'nickname', 'avatar'] },
      { model: Game, as: 'game', attributes: ['id', 'title', 'status'] }
    ],
    order: [['sentAt', 'DESC']]
  });

  return Result.ok(invitations);
}

/* =======================================
   🔹 Listar invitaciones enviadas
   ======================================= */
export async function getSentInvitations(userId) {
  const player = await Player.findOne({ where: { userId } });
  if (!player) return Result.err(new AppError('Jugador no encontrado', 404));

  const invitations = await GameInvitation.findAll({
    where: { senderId: player.id },
    include: [
      { model: Player, as: 'receiver', attributes: ['id', 'nickname', 'avatar'] },
      { model: Game, as: 'game', attributes: ['id', 'title', 'status'] }
    ],
    order: [['sentAt', 'DESC']]
  });

  return Result.ok(invitations);
}
