import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import playerFromUser from '../middlewares/playerFromUser.js';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

// Partidas CRUD
router.get('/', authMiddleware, gameController.listGames);
router.post('/create', authMiddleware, gameController.createGame);
router.get('/:id', authMiddleware, gameController.getGameById);
router.patch('/:id', authMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, gameController.deleteGame);

// Unión 
router.post('/join', authMiddleware, playerFromUser, gameController.joinGame);
router.post('/leave', authMiddleware, playerFromUser, gameController.leaveGame);

// Inicio / fin partida
router.post('/start', authMiddleware, gameController.startGame);
router.post('/end', authMiddleware, gameController.endGame);

// Movimientos
router.post('/move', authMiddleware, gameController.makeMoveController);
router.get('/:gameId/moves', authMiddleware, gameController.getMovesByGame);

// Información adicional
router.get('/:id/players', authMiddleware, gameController.getGamePlayers);
router.get('/:id/state', authMiddleware, gameController.getGameState);
router.get('/:id/scores', authMiddleware, gameController.getGameScores);
router.get('/:id/history', authMiddleware, gameController.getGameHistoryController);

// Ranking global
router.get('/ranking/global', authMiddleware, gameController.getRankingController);

export default router;
