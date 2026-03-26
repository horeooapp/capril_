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

const redisGlobal = global as typeof globalThis & {
    redis: any;
};

if (redisGlobal.redis) {
    redis = redisGlobal.redis;
} else {
    const useMock = process.env.ENABLE_REDIS_MOCK === 'true';

    if (useMock) {
        console.log('[Redis] Using Mock implementation (Development Mode)');
        redis = new MockRedis();
        redisGlobal.redis = redis;
    } else if (process.env.REDIS_URL) {
        try {
            const redisOptions = {
                maxRetriesPerRequest: 1,
                commandTimeout: 2000,
                retryStrategy: (times: number) => (times > 1 ? null : 50),
                tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
            };

            const client = new Redis(process.env.REDIS_URL, redisOptions);
            client.on('error', (err) => {
                console.error('[Redis] Connection Error:', err.message);
            });
            redis = client;
            redisGlobal.redis = redis;
        } catch (e) {
            console.error('[Redis] Failed to initialize client:', e);
            // Fallback unique if definitely nothing else
            redis = new MockRedis();
            redisGlobal.redis = redis;
        }
    } else {
        // No URL and Mock not explicitly enabled? Default to mock to avoid crash
        console.warn('[Redis] No REDIS_URL found and Mock not explicitly enabled. Defaulting to Mock.');
        redis = new MockRedis();
        redisGlobal.redis = redis;
    }
}

export { redis };
export default redis;
