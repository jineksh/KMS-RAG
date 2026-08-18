import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import {
    signup,
    signin,
    getUserProfile,
} from '../../controllers/user.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/:userId', verifyToken, getUserProfile);

export default router;
