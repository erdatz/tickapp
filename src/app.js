// src/app.js
import express from 'express';
import cors from 'cors';

// Rutas
import authRoutes from './routes/auth.routes.js';
import gameRoutes from './routes/game.routes.js';
import invitationRoutes from './routes/invitation.routes.js';
import playerRoutes from './routes/player.routes.js';
import scoreRoutes from './routes/score.routes.js';
import statsRoutes from './routes/stats.routes.js';

// Middlewares
import errorMiddleware from './middlewares/errorMiddleware.js';
import { cacheMiddleware } from './middlewares/cacheMiddleware.js';
import trackMiddleware from './middlewares/trackMiddleware.js';

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parseo de JSON
app.use(express.json());

// Middleware de tracking
app.use(trackMiddleware);

// Configuración de cache
const cacheConfig = { max: 50, maxAge: 5000 };

// Rutas con sus middlewares
app.use('/auth', authRoutes);
app.use('/game', cacheMiddleware(cacheConfig), gameRoutes);
app.use('/invitation', cacheMiddleware(cacheConfig), invitationRoutes);
app.use('/player', cacheMiddleware(cacheConfig), playerRoutes);
app.use('/score', cacheMiddleware(cacheConfig), scoreRoutes);
app.use('/stats', statsRoutes);

// Middleware de manejo de errores
app.use(errorMiddleware);

export default app;
