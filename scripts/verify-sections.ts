import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    const sections = await sql`SELECT id, template_slug, config FROM page_section WHERE page_name = 'products_home' ORDER BY "order"`;
    for (const s of sections as any[]) {
        console.log(`[${s.template_slug}] config:`, JSON.stringify(s.config, null, 2));
    }
}

main().catch(e => { console.error(e); process.exit(1); });
