import express from 'express';
import { PORT } from './config/env.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
    console.log(`[Server] : Started on port ${PORT}`);
});

export default app;
