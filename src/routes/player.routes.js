import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createPlayer, getPlayerById, updatePlayer, deletePlayer, patchPlayer } from '../controllers/playerController.js';

const router = express.Router();

router.post('/', authMiddleware, createPlayer);
router.get('/:id', authMiddleware, getPlayerById);
router.put('/:id', authMiddleware, updatePlayer);
router.patch('/:id', authMiddleware, patchPlayer);
router.delete('/:id', authMiddleware, deletePlayer);

export default router;
