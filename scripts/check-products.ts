import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    
    // Check what product types exist
    const types = await sql`SELECT slug, name FROM product_types ORDER BY slug`;
    console.log('Product types:', (types as any[]).map(t => `${t.slug} (${t.name})`));
    
    // Check what promotion tags exist
    const tags = await sql`SELECT DISTINCT promotion_tag FROM product WHERE promotion_tag IS NOT NULL`;
    console.log('Promotion tags:', (tags as any[]).map(t => t.promotion_tag));
    
    // Check products with product_type = 'ac' and tag = 'sale'
    const acSale = await sql`SELECT count(*) as cnt FROM product WHERE product_type = 'ac' AND promotion_tag = 'sale' AND is_published = true`;
    console.log('Products with type=ac, tag=sale:', (acSale as any[])[0].cnt);
    
    // Check products with product_type = 'ac' (any tag)
    const acAny = await sql`SELECT count(*) as cnt FROM product WHERE product_type = 'ac' AND is_published = true`;
    console.log('Products with type=ac (any tag):', (acAny as any[])[0].cnt);
    
    // Check products with product_type = 'dryer' and tag = 'lo'
    const dryerLo = await sql`SELECT count(*) as cnt FROM product WHERE product_type = 'dryer' AND promotion_tag = 'lo' AND is_published = true`;
    console.log('Products with type=dryer, tag=lo:', (dryerLo as any[])[0].cnt);
    
    // What product types actually have products?
    const usedTypes = await sql`SELECT product_type, count(*) as cnt FROM product WHERE is_published = true GROUP BY product_type ORDER BY cnt DESC`;
    console.log('Used product types:', (usedTypes as any[]).map(t => `${t.product_type}: ${t.cnt}`));
}

main().catch(e => { console.error(e); process.exit(1); });
