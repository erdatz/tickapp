import * as invitationService from '../services/invitation.service.js';

export async function sendInvitation(req, res, next) {
  const senderId = req.user.id;          // User ID
  const { receiverId } = req.body;       // User ID

  const result = await invitationService.sendInvitation(senderId, receiverId);
  if (result.isErr) return next(result.error);

  res.status(201).json(result.value);
}

export async function acceptInvitation(req, res, next) {
  const userId = req.user.id;            // User ID
  const { invitationId } = req.body;

  const result = await invitationService.acceptInvitation(userId, invitationId);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value);
}

export async function rejectInvitation(req, res, next) {
  const userId = req.user.id;            // User ID
  const { invitationId } = req.body;

  const result = await invitationService.rejectInvitation(userId, invitationId);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value);
}

export async function getReceivedInvitations(req, res, next) {
  const userId = req.user.id;            // User ID

  const result = await invitationService.getReceivedInvitations(userId);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value);
}

export async function getSentInvitations(req, res, next) {
  const userId = req.user.id;            // User ID

  const result = await invitationService.getSentInvitations(userId);
  if (result.isErr) return next(result.error);

  res.status(200).json(result.value);
}
