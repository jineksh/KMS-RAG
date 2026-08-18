import dotenv from 'dotenv';
dotenv.config()


export const PORT = process.env.PORT;

export const DATABASE_URL = process.env.DATABASE_URL;

export const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';


export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const ROBOHASH_URL = process.env.ROBOHASH_URL || 'https://robohash.org';
export const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '7d';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || 6379;