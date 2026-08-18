import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_EXPIRATION } from '../config/env.js';


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