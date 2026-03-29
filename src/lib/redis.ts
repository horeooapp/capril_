import Redis from 'ioredis';

import fs from 'fs';
import path from 'path';

// Mock simple pour le développement ou les cas où Redis est HS, sauvegardé sur disque.
class MockRedis {
    private filePath = path.join(process.cwd(), '.redis-mock.json');
    status = 'mock';

    private loadStore(): Record<string, { value: string, expiry: number }> {
        try {
            if (fs.existsSync(this.filePath)) {
                return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
            }
        } catch (e) {
            console.error('[MockRedis] Error loading file:', e);
        }
        return {};
    }

    private saveStore(store: Record<string, { value: string, expiry: number }>) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(store), 'utf-8');
        } catch (e) {
            console.error('[MockRedis] Error saving file:', e);
        }
    }

    async set(key: string, value: string, mode?: string, duration?: number) {
        const store = this.loadStore();
        const expiry = Date.now() + (duration ? duration * 1000 : 3600000);
        store[key] = { value, expiry };
        this.saveStore(store);
        return 'OK';
    }

    async get(key: string) {
        const store = this.loadStore();
        const item = store[key];
        if (!item || item.expiry < Date.now()) {
            if (item) {
                delete store[key];
                this.saveStore(store);
            }
            return null;
        }
        return item.value;
    }

    async del(key: string) {
        const store = this.loadStore();
        delete store[key];
        this.saveStore(store);
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
