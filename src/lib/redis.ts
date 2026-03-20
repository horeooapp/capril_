import Redis from 'ioredis';

// Mock simple pour le développement ou les cas où Redis est HS
class MockRedis {
    private store = new Map<string, { value: string, expiry: number }>();
    status = 'mock';

    async set(key: string, value: string, mode?: string, duration?: number) {
        const expiry = Date.now() + (duration ? duration * 1000 : 3600000);
        this.store.set(key, { value, expiry });
        return 'OK';
    }

    async get(key: string) {
        const item = this.store.get(key);
        if (!item || item.expiry < Date.now()) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async del(key: string) {
        this.store.delete(key);
        return 1;
    }
}

let redis: any = null;

if (process.env.REDIS_URL) {
    try {
        const redisGlobal = global as typeof globalThis & {
            redis: any;
        };
        
        const redisOptions = {
            maxRetriesPerRequest: 1,
            commandTimeout: 2000,
            retryStrategy: (times: number) => (times > 1 ? null : 50),
            tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
        };

        if (redisGlobal.redis) {
            redis = redisGlobal.redis;
        } else {
            const client = new Redis(process.env.REDIS_URL, redisOptions);
            client.on('error', (err) => {
                console.error('[Redis] Connection Error:', err.message);
            });
            redis = client;
            if (process.env.NODE_ENV !== 'production') {
                redisGlobal.redis = redis;
            }
        }
    } catch (e) {
        console.error('[Redis] Failed to initialize client:', e);
        if (process.env.ENABLE_REDIS_MOCK === 'true') {
            redis = new MockRedis();
        }
    }
} else if (process.env.ENABLE_REDIS_MOCK === 'true') {
    redis = new MockRedis();
}

export { redis };
export default redis;
