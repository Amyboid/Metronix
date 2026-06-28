import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    
    const templates = await sql`SELECT slug, name, schema_definition FROM section_template ORDER BY slug`;
    for (const t of templates as any[]) {
        const schema = t.schema_definition;
        const hasLabels = schema.some((f: any) => f.label);
        const hasSource = schema.some((f: any) => f.source);
        const hasSelectType = schema.some((f: any) => f.type === 'select');
        console.log(`${t.slug}: labels=${hasLabels} source=${hasSource} selectType=${hasSelectType}`);
        console.log(`  Fields: ${schema.map((f: any) => `${f.field}(${f.type}${f.label ? ' label:'+f.label : ''}${f.source ? ' source:'+f.source : ''})`).join(', ')}`);
    }
}

main().catch(e => { console.error(e); process.exit(1); });
