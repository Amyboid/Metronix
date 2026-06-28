import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    const cats = await sql`SELECT slug FROM categories ORDER BY slug`;
    console.log('Category slugs:', (cats as any[]).map(c => c.slug));
}

main().catch(e => { console.error(e); process.exit(1); });
