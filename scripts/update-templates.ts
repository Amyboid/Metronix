import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const templates = [
    {
        slug: "product-slider",
        name: "Product Slider",
        schemaDefinition: JSON.stringify([
            { field: "heading", type: "text", label: "Heading", required: true },
            { field: "filterType", type: "select", label: "Filter By", options: ["category", "product_type"], required: true },
            { field: "filterValue", type: "select", label: "Value", source: "dynamic", dependsOn: "filterType", required: true },
            { field: "tag", type: "select", label: "Promotion Tag", options: ["essential"] },
            { field: "limit", type: "number", label: "Max Products", options: ["4", "6", "8", "10", "12"] },
            { field: "ctaText", type: "text", label: "CTA Text" },
        ])
    },
    {
        slug: "hero-banner",
        name: "Hero Banner",
        schemaDefinition: JSON.stringify([
            { field: "heading", type: "text", label: "Heading", required: true },
            { field: "imagePath", type: "text", label: "Image Path" },
            { field: "ctaLink", type: "select", label: "CTA Link", options: ["/products", "/products/consumer-electronics", "/products/home-appliances", "/products/kitchen-appliances", "/products/self-care-appliances", "/about", "/contact"] },
        ])
    },
    {
        slug: "feature-grid",
        name: "Feature Grid",
        schemaDefinition: JSON.stringify([
            { field: "heading", type: "text", label: "Heading", required: true },
            { field: "limit", type: "number", label: "Number of Items", options: ["3", "4", "6"] },
        ])
    }
];

async function main() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    const sql = neon(process.env.DATABASE_URL);
    for (const tpl of templates) {
        await sql`INSERT INTO section_template (slug, name, schema_definition) 
            VALUES (${tpl.slug}, ${tpl.name}, ${tpl.schemaDefinition}::jsonb) 
            ON CONFLICT (slug) DO UPDATE SET name = ${tpl.name}, schema_definition = ${tpl.schemaDefinition}::jsonb`;
        console.log(`Updated: ${tpl.slug}`);
    }
    console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
