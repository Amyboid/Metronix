import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    const types = await sql`SELECT slug FROM product_type ORDER BY slug`;
    console.log('Product type slugs:', (types as any[]).map(t => t.slug));
}

main().catch(e => { console.error(e); process.exit(1); });
