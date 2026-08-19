import { getQueryAnswer } from '../rag/query.js';

export async function getAnswer(req, res) {
    try {
        const query = req.body?.query;

        if (typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A non-empty query is required',
            });
        }

        const answer = await getQueryAnswer(query.trim());

        return res.status(200).json({
            success: true,
            message: 'Query answered successfully',
            data: answer,
        });
    } catch (error) {
        console.error('Failed to answer query:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}