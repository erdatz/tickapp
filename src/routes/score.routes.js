import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createScore, getScoreById, updateScore, deleteScore, patchScore } from '../controllers/scoreController.js';

const router = express.Router();

router.post('/', authMiddleware, createScore);
router.get('/:id', authMiddleware, getScoreById);
router.put('/:id', authMiddleware, updateScore);
router.patch('/:id', authMiddleware, patchScore);
router.delete('/:id', authMiddleware, deleteScore);

export default router;
