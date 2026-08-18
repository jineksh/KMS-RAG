import  'dotenv/config';

import { Worker } from 'bullmq';
import { indexingPhase } from '../src/rag/ingition.js';
import redisConnection from '../src/config/redis.js';
import { prisma } from '../src/config/db.js';
import { pubRedis } from '../src/config/redis.js';




const indexingWorker = new Worker('indexing', async (job) => {


    const { filePath, documentId } = job.data;

    try {


        await indexingPhase(filePath, documentId);

        await prisma.document.update({
            where: { id: documentId },
            data: { status: 'PROCESSED' },
        });

        await pubRedis.publish('indexing-complete', JSON.stringify({ 
            id : documentId,
            status: 'PROCESSED'

        }));


    } catch (error) {
        console.error('Error occurred while processing indexing job:', error);
        await prisma.document.update({
            where: { id: documentId },
            data: { status: 'FAILED' },
        });
        await pubRedis.publish('indexing-complete', JSON.stringify({ 
            id : documentId,
            status: 'FAILED'
            
        }));
    }

}, { connection: redisConnection });

