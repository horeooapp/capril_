

// Redis client initialization

let redis: any = null;

const redisGlobal = global as typeof globalThis & {
    redis: any;
};

if (redisGlobal.redis) {
    redis = redisGlobal.redis;
} else {
    const isEdge = process.env.NEXT_RUNTIME === 'edge';
    if (!isEdge && process.env.REDIS_URL) {
        // Node.js runtime with REDIS_URL
        try {
            const redisOptions = {
                maxRetriesPerRequest: 1,
                commandTimeout: 2000,
                retryStrategy: (times: number) => (times > 1 ? null : 50),
                tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
            };

            // Use dynamic import to avoid Edge bundling issues
            import(/* webpackIgnore: true */ 'ioredis').then((RedisModule) => {
                const Redis = RedisModule.default;
                const client = new Redis(process.env.REDIS_URL!, redisOptions);
                client.on('error', (err: any) => {
                    console.error('[Redis] Connection Error:', err.message);
                });
                redis = client;
                redisGlobal.redis = redis;
            }).catch(e => {
                console.error('[Redis] Failed to dynamic import ioredis:', e);
            });
        } catch (e) {
            console.error('[Redis] Failed to initialize Redis branch:', e);
        }
    } else {
        if (isEdge) {
            console.warn('[Redis] Edge Runtime - Redis client (ioredis) is not supported in this runtime.');
        } else {
            console.warn('[Redis] No REDIS_URL provided. Redis functionality will be disabled.');
        }
    }
}

export { redis };
export default redis;
