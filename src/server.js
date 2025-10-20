import app from './app.js';
import sequelize from './config/database.js';
import './models/index.js';
import { initSocket } from './services/socket.service.js';
import logger from './utils/logger.js';
import Result from './utils/result.js';
import AppError from './utils/AppError.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  //  Conexión a la base de datos
  const authDb = await Result.fromPromise(
    sequelize.authenticate(),
    (e) => new AppError('Database connection failed', 500, { cause: e })
  );
  if (authDb.isErr) {
    logger.error(authDb.error);
    process.exit(1);
  }

  logger.info(' Database connection established successfully.');

  //  Sincronizar modelos (solo crear si no existe)
  const syncRes = await Result.fromPromise(
    sequelize.sync({ alter: false, force: false }),
    (e) => new AppError('Database sync failed', 500, { cause: e })
  );
  if (syncRes.isErr) {
    logger.error(syncRes.error);
    process.exit(1);
  }

  logger.info('Database synchronized without altering existing schema.');

  //  Iniciar servidor HTTP y WebSocket
  const server = app.listen(PORT, () => {
    logger.info(` Server running on port ${PORT}`);
  });

  //  Inicializar sockets
  initSocket(server);
}

startServer();
