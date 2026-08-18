import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { SALT_ROUNDS, ROBOHASH_URL, TOKEN_EXPIRATION, JWT_SECRET } from '../config/env.js';

export const hashPassword = async (password) => {
    try {
        const salt = bcrypt.genSaltSync(parseInt(SALT_ROUNDS));
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error(`Error hashing password: ${error.message}`);
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error(`Error comparing passwords: ${error.message}`);
    }
};

export const generateAvatarUrl = (username) => {
    return `https://robohash.org/${username}`;
};



export const signupUser = async ({ username, email, password }) => {
    try {
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await hashPassword(password);
        const avatar = generateAvatarUrl(username);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                avatar,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    } catch (error) {
        throw new Error(`Signup failed: ${error.message}`);
    }
};




export const generateToken = (userId,user_email) => {
    try {
        const token = jwt.sign(
            { id: userId,email : user_email },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );
        return token;
    } catch (error) {
        throw new Error(`Error generating token: ${error.message}`);
    }
};


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
        const token = generateToken(user.id, user.email);

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
