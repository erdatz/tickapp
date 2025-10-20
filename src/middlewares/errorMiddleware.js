import logger from '../utils/logger.js';

export default function errorMiddleware(err, req, res, next) {
  const status = err?.status ?? 500;
  const message = err?.message ?? 'Internal server error';

  logger.error('%s %s - %s', req.method, req.url, err.stack || err);

  const response = { message };
  if (process.env.NODE_ENV !== 'production' && err?.cause) {
    response.cause = String(err.cause);
  }

  res.status(status).json(response);
}
