import express from 'express';
import userRoutes from './v1/user.routes.js';
import documentRoutes from './v1/document.routes.js';
import queryRoutes from './v1/query.js'

const router = express.Router();

/**
 * API v1 Routes
 */
router.use('/v1/users', userRoutes);
router.use('/v1/documents', documentRoutes);
router.use('/v1/query',queryRoutes)

export default router;
