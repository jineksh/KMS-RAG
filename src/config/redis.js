import Redis from 'ioredis'

import { REDIS_HOST, REDIS_PORT } from './env.js';

const redisConnection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null
});

export const pubRedis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxLoadingRetryTime: null
});

export const subRedis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null
});

redisConnection.on('connect', () => {
    console.log('[Redis] : Connected to Redis server');
});

redisConnection.on('error', (err) => {
    console.error('[Redis] : Redis connection error:', err);
});

export default redisConnection;
