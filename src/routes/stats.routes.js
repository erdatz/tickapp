import express from 'express';
import * as statsController from '../controllers/statsController.js';

const router = express.Router();

router.get('/requests', statsController.getRequestStats);
router.get('/response-times', statsController.getResponseTimes);
router.get('/status-codes', statsController.getStatusCodes);
router.get('/popular-endpoints', statsController.getPopularEndpoints);

export default router;
