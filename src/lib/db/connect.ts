import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing! Check your .env file.');
}

// Initialize the connection client
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);

console.log('Drizzle initialized with Neon (HTTP mode)');