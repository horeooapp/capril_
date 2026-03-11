import Redis from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
    try {
        const redisGlobal = global as typeof globalThis & {
            redis: Redis | undefined;
        };
        const redisOptions = {
            maxRetriesPerRequest: 3,
            commandTimeout: 5000,
            retryStrategy(times: number) {
                if (times > 3) {
                    return null; // Stop retrying and throw error
                }
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
        };

        redis = redisGlobal.redis ?? new Redis(process.env.REDIS_URL, redisOptions);
            
        if (process.env.NODE_ENV !== 'production') {
            redisGlobal.redis = redis;
        }
    } catch {
        console.warn('[Redis] ioredis not available — Redis features disabled.');
    }
}

export { redis };
export default redis;
