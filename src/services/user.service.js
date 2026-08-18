import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { SALT_ROUNDS, ROBOHASH_URL, TOKEN_EXPIRATION,JWT_SECRET } from '../config/env.js'; 



/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
    try {
        const salt = bcrypt.genSaltSync(parseInt(SALT_ROUNDS));
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Error hashing password: ${error.message}`);
    }
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error(`Error comparing passwords: ${error.message}`);
    }
};

/**
 * Generate avatar URL using robohash
 * @param {string} username - Username for avatar generation
 * @returns {string} Avatar URL
 */
export const generateAvatarUrl = (username) => {
    const url = `https://robohash.org/${username}`;
    console.log(`[avtar] : Generated avatar URL for ${username}: ${url}`);
    return url;
};

/**
 * Signup new user
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Plain text password
 * @returns {Promise<Object>} Created user object (without password)
 * @throws {Error} If user already exists or database error
 */
export const signupUser = async ({ username, email, password }) => {
    try {
        // Validate input
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required');
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('Email already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate avatar URL
        const avatar = generateAvatarUrl(username);

        console.log(`[avtar] : Generated avatar URL for ${username}: ${avatar}`);

        // Create user in database
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                avatar,
            },
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        throw new Error(`Signup failed: ${error.message}`);
    }
};

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @returns {string} JWT token
 * @throws {Error} If token generation fails
 */
export const generateToken = (userId) => {
    try {
        const token = jwt.sign(
            { id: userId },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating token: ${error.message}`);
    }
};

/**
 * Signin user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<Object>} User object with token (without password)
 * @throws {Error} If credentials are invalid or user not found
 */
export const signinUser = async ({ email, password }) => {
    try {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user without password and with token
        const { password: _, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token,
        };
    } catch (error) {
        throw new Error(`Signin failed: ${error.message}`);
    }
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {Error} If user not found
 */
export const getUserById = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};
