import Redis from 'ioredis';

// Edge-compatible In-memory store for MockRedis
const memoryStore = new Map<string, { value: string, expiry: number }>();

class MockRedis {
    status = 'mock';

    async set(key: string, value: string, mode?: string, duration?: number) {
        const expiry = Date.now() + (duration ? duration * 1000 : 3600000);
        memoryStore.set(key, { value, expiry });
        return 'OK';
    }

    async get(key: string) {
        const item = memoryStore.get(key);
        if (!item || item.expiry < Date.now()) {
            if (item) memoryStore.delete(key);
            return null;
        }
        return item.value;
    }

    async incr(key: string): Promise<number> {
        const item = memoryStore.get(key);
        let val = 0;
        if (item && item.expiry >= Date.now()) {
            val = parseInt(item.value) || 0;
        }
        val++;
        memoryStore.set(key, { value: val.toString(), expiry: Date.now() + 60000 });
        return val;
    }

    async expire(key: string, seconds: number) {
        const item = memoryStore.get(key);
        if (item) {
            item.expiry = Date.now() + (seconds * 1000);
            return 1;
        }
        return 0;
    }

    async del(key: string) {
        return memoryStore.delete(key) ? 1 : 0;
    }
}

let redis: any = null;

const redisGlobal = global as typeof globalThis & {
    redis: any;
};

if (redisGlobal.redis && typeof redisGlobal.redis.loadStore === 'function') {
    redis = redisGlobal.redis;
} else {
    const useMock = process.env.ENABLE_REDIS_MOCK === 'true';

    if (useMock) {
        console.log('[Redis] Using Mock implementation (Development Mode) - File Backed');
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
