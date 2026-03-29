import redis from './src/lib/redis';

async function test() {
    console.log("Redis type:", Object.getPrototypeOf(redis));
    await redis.set('test_key', '123456');
    const val = await redis.get('test_key');
    console.log("Val:", val);
}

test();
