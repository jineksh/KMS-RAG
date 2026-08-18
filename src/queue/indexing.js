import {Queue} from 'bullmq';
import redisConnection from '../config/redis.js';

const indexingQueue = new Queue('indexing', {
    connection: redisConnection,
});



export default indexingQueue;