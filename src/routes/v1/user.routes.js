import express from 'express';
import {
    signup,
    signin,
    getUserProfile,
} from '../../controllers/user.controller.js';

const router = express.Router();

/**
 * POST /api/v1/users/signup
 * Register a new user
 * @body {string} username - Username
 * @body {string} email - Email address
 * @body {string} password - Password (min 6 characters)
 * @body {string} confirmPassword - Confirm password (optional)
 */
router.post('/signup', signup);

/**
 * POST /api/v1/users/signin
 * Authenticate user
 * @body {string} email - Email address
 * @body {string} password - Password
 * @returns {Object} User object with JWT token
 */
router.post('/signin', signin);

/**
 * GET /api/v1/users/:userId
 * Get user profile by ID
 * @param {number} userId - User ID
 */
router.get('/:userId', getUserProfile);

export default router;
