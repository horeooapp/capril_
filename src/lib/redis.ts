/**
 * Redis client — optional dependency.
 * Only active if REDIS_URL is set. Otherwise returns null (safe no-op for most use cases).
 */

let redis: any = null;

if (process.env.REDIS_URL) {
    try {
        const Redis = require('ioredis');
        const redisGlobal = global as any;
        redis = redisGlobal.redis ?? new Redis(process.env.REDIS_URL);
        if (process.env.NODE_ENV !== 'production') {
            redisGlobal.redis = redis;
        }
    } catch {
        console.warn('[Redis] ioredis not available — Redis features disabled.');
    }
}

export { redis };
export default redis;
