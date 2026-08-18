import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;

export const DATABASE_URL = process.env.DATABASE_URL;

export const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';


export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const ROBOHASH_URL = process.env.ROBOHASH_URL;
export const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '7d';