import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    
    const sections = await sql`SELECT id, template_slug, config, is_active, "order" FROM page_section WHERE page_name = 'products_home' ORDER BY "order"`;
    for (const s of sections as any[]) {
        console.log(`#${s.order} [${s.template_slug}] active=${s.is_active} config:`, s.config);
    }
    
    const templates = await sql`SELECT slug, name, schema_definition FROM section_template`;
    for (const t of templates as any[]) {
        console.log(`\nTemplate: ${t.slug} (${t.name})`);
        console.log(`  Schema:`, t.schema_definition);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
