import Redis from 'ioredis';

let redis: any = null;

if (process.env.REDIS_URL) {
    try {
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
