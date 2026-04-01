import Redis from 'ioredis';
// import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the correct path to .env
const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

let redis;
export const connectRedis = () => {
	try {
		if (!process.env.REDIS_URL) {
			console.warn(
				'REDIS_URL not set in environment variables. Skipping Redis connection.',
			);
			return null;
		}
		redis = new Redis(process.env.REDIS_URL);
		console.log('Redis connected successfully');
		return redis;
	} catch (error) {
		console.error('Error connecting to Redis:', error);
	}
};
