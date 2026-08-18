import {
    signupUser,
    signinUser,
    getUserById,
} from '../services/user.service.js';

/**
 * Controller for user signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate that all required fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required',
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Validate password confirmation if provided
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        // Call service to create user
        const newUser = await signupUser({
            username,
            email,
            password,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser,
        });
    } catch (error) {
        // Handle specific error messages
        if (
            error.message.includes('already exists') ||
            error.message.includes('required')
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * Controller for user signin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Call service to authenticate user
        const user = await signinUser({
            email,
            password,
        });

        return res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: user,
        });
    } catch (error) {
        // Handle invalid credentials
        if (error.message.includes('Invalid email or password')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * Controller to get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId is provided and is a number
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required',
            });
        }

        // Call service to get user
        const user = await getUserById(parseInt(userId));

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        // Handle user not found
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
