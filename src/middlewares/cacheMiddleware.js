import { Result } from '../utils/result.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware de memorización configurable (LRU)
 * @param {Object} config - Configuración: { max: número máximo de items, maxAge: tiempo de expiración en ms }
 */
export const cacheMiddleware = (config = { max: 50, maxAge: 5000 }) => {
  const cacheMap = new Map();

  const getCacheKey = (req) =>
    `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}:${JSON.stringify(req.body)}`;

  const cleanExpired = () => {
    const now = Date.now();
    [...cacheMap.entries()]
      .filter(([_, { timestamp }]) => now - timestamp >= config.maxAge)
      .forEach(([key]) => {
        console.log(`[CACHE EXPIRED] Key removed: ${key}`);
        cacheMap.delete(key);
      });
      console.log('[CACHE STATE AFTER CLEAN]:', Array.from(cacheMap.entries()));
  };

  const updateLRU = (key, value) => {
    cacheMap.delete(key);
    cacheMap.set(key, value);
    console.log(`[CACHE UPDATE] Key refreshed/added: ${key}`);
    console.log('[CACHE STATE CURRENT]:', Array.from(cacheMap.entries()));
  };

  return (req, res, next) => {
    const key = getCacheKey(req);
    cleanExpired();
    const cachedResult = Result.fromTry(() => cacheMap.get(key));
    cachedResult
      .andThen((cached) => {
        if (!cached) return Result.err(new AppError('No cache', 404));
        console.log(`[CACHE HIT] Serving from cache: ${key}`);
        updateLRU(key, { timestamp: Date.now(), data: cached.data });
        res.json(cached.data);
        console.log('[CACHE STATE END OF REQUEST]:', Array.from(cacheMap.entries()));
        return Result.ok(null);
      })
      .mapErr(() => {
        console.log(`[CACHE MISS] No entry found, will store after response: ${key}`);
        const originalSend = res.send.bind(res);
        res.send = (body) => {
          let data = body;
          if (typeof body === 'string') {
              data = JSON.parse(body);
          }
          if (cacheMap.size >= config.max) {
            const firstKey = cacheMap.keys().next().value;
            console.log(`[CACHE EVICT] Max size reached, removing LRU key: ${firstKey}`);
            cacheMap.delete(firstKey);
          }
          updateLRU(key, { timestamp: Date.now(), data });
          console.log('[CACHE STATE AFTER STORE]:', Array.from(cacheMap.entries()));
          return originalSend(body);
        };
        next();
      });
  };
};
