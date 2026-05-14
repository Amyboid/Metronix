import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema'
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing! Check your .env file.');
}

// Initialize the connection client
const sql = neon(process.env.DATABASE_URL);
console.log('Drizzle initialized with Neon (HTTP mode)');
export const db = drizzle(sql, { schema });
