import express from 'express'
import { PORT } from './config/env.js'
import { connectToDatabase } from './config/db.js'
import apiRoutes from './routes/index.js'
import { prisma } from './config/db.js'
import { subRedis } from './config/redis.js'

const app = express()

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
        const { id, status } = JSON.parse(message)
        console.log(`[Redis] : Received message on channel ${channel}: Document ID: ${id}, Status: ${status}`)

        const clientResponse = clients.get(String(id))

        if (clientResponse) {
            clientResponse.write(`data: ${JSON.stringify({ id, status })}\n\n`)

            if (status === 'done' || status === 'failed') {
                clientResponse.end()
                clients.delete(String(id))
                console.log(`[SSE] : Connection closed for document: ${id}`)
            }

        } else {
            console.warn(`[SSE] : No client found for document ID: ${id}`)
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

app.get('/api/documents/:documentId/events', async(req, res) => {
    const { documentId } = req.params

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const document = await prisma.document.findUnique({
        where: { id: Number(documentId) },
        select: { status: true }
    });

    if (!document) {
        res.write(`data: ${JSON.stringify({ status: 'failed', message: 'Document not found' })}\n\n`)
        res.end()
        return
    }


    if (document.status === 'done' || document.status === 'failed') {
        res.write(`data: ${JSON.stringify({ id: documentId, status: document.status })}\n\n`)
        res.end()  // SSE band karo
        console.log(`[SSE] : Document already ${document.status}, closing connection`)
        return
    }

    clients.set(String(documentId), res)
    console.log(`[SSE] : Client connected for document: ${documentId}`)

    req.on('close', () => {
        clients.delete(String(documentId))
        console.log(`[SSE] : Client disconnected for document: ${documentId}`)
    })
})

app.listen(PORT, async () => {
    await connectToDatabase()
    await prisma.document.deleteMany({})
    console.log(`[Server] : Started on port ${PORT}`)
})

export default app