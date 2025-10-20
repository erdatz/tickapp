import ApiStat from '../models/ApiStat.js';
import Result from '../utils/result.js';
import AppError from '../utils/AppError.js';

export default function trackMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    console.log(`[API TRACK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}, Duration: ${duration}ms, User: ${req.user?.id || 'Guest'}`);

    const logRes = await Result.fromPromise(
      ApiStat.create({
        endpointAccess: req.originalUrl,
        requestMethod: req.method,
        statusCode: res.statusCode,
        responseTime: { avg: duration, min: duration, max: duration },
        timestamp: new Date(),
        userId: req.user?.id || null
      }),
      (e) => new AppError('Error logging API stat', 500, { cause: e })
    );

    logRes.mapErr((err) => {
      console.error('[API TRACK ERROR]', err);
    });
  });

  next();
}
