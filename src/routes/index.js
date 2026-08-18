import express from 'express';
import userRoutes from './v1/user.routes.js';
import documentRoutes from './v1/document.routes.js';

const router = express.Router();

/**
 * API v1 Routes
 */
router.use('/v1/users', userRoutes);
router.use('/v1/documents', documentRoutes);

export default router;
