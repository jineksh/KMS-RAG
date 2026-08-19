import express from 'express'
import { PORT } from './config/env.js'
import { connectToDatabase } from './config/db.js'
import apiRoutes from './routes/index.js'
import { prisma } from './config/db.js'
import { subRedis } from './config/redis.js'
import cors from 'cors'


const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
)

const clients = new Map()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

subRedis.subscribe('indexing-complete', (err) => {
    if (err) {
        console.error('[Redis] : Failed to subscribe to indexing-complete channel:', err)
    }
})

subRedis.on('message', async (channel, message) => {
    if (channel === 'indexing-complete') {
        try {
            const { id, status } = JSON.parse(message)
            console.log(`[Redis] : Message on ${channel} -> Doc ID: ${id}, Status: ${status}`)

            const clientSet = clients.get(String(id))

            if (clientSet && clientSet.size > 0) {
                const payload = `data: ${JSON.stringify({ id, status })}\n\n`

                clientSet.forEach((res) => {
                    res.write(payload)

                    if (status === 'PROCESSED' || status === 'FAILED') {
                        res.end()
                    }
                })

                if (status === 'PROCESSED' || status === 'FAILED') {
                    clients.delete(String(id))
                    console.log(`[SSE] : Closed connections for document: ${id}`)
                }
            } else {
                console.warn(`[SSE] : No active client found for document ID: ${id}`)
            }
        } catch (err) {
            console.error('[Redis SSE] : Error handling message:', err)
        }
    }
})

app.use('/api', apiRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    })
})

app.get('/', (req, res) => {
    res.json({ message: 'API is running' })
})

app.get('/api/v1/documents/:documentId/events', async (req, res) => {
    const { documentId } = req.params
    const parsedId = Number(documentId)

    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Invalid document ID' })
    }

    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')


    res.flushHeaders()

    const document = await prisma.document.findUnique({
        where: { id: parsedId },
        select: { status: true },
    })

    if (!document) {
        res.write(`data: ${JSON.stringify({ status: 'FAILED', message: 'Document not found' })}\n\n`)
        res.end()
        return
    }


    if (document.status === 'PROCESSED' || document.status === 'FAILED') {
        res.write(`data: ${JSON.stringify({ id: documentId, status: document.status })}\n\n`)
        res.end()
        console.log(`[SSE] : Document already ${document.status}, closed connection for: ${documentId}`)
        return
    }


    if (!clients.has(String(documentId))) {
        clients.set(String(documentId), new Set())
    }
    const clientSet = clients.get(String(documentId))
    clientSet.add(res)

    console.log(`[SSE] : Client connected for document: ${documentId} (Active listeners: ${clientSet.size})`)

    // Cleanup on connection drop / abort
    req.on('close', () => {
        clientSet.delete(res)
        if (clientSet.size === 0) {
            clients.delete(String(documentId))
        }
        console.log(`[SSE] : Client disconnected for document: ${documentId}`)
    })
})

app.listen(PORT, async () => {
    await connectToDatabase()
    await prisma.document.deleteMany({})
    console.log(`[Server] : Started on port ${PORT}`)
})

export default app