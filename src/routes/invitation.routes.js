import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as invitationController from '../controllers/invitationController.js';

const router = express.Router();

router.post('/send', authMiddleware, invitationController.sendInvitation);
router.post('/accept', authMiddleware, invitationController.acceptInvitation);
router.post('/reject', authMiddleware, invitationController.rejectInvitation);
router.get('/received', authMiddleware, invitationController.getReceivedInvitations);
router.get('/sent', authMiddleware, invitationController.getSentInvitations);

export default router;
