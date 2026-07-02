import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { brands, categories, productTypes, tags, products, colors } from '$lib/server/db/schema';
import { asc, count, eq, and, inArray } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const slug = url.searchParams.get('slug'); // current page slug (category or product type)
    const filterBrands = url.searchParams.getAll('brand');
    const filterTypes = url.searchParams.getAll('type');

    // Determine context: is slug a category or a product type?
    let context: 'category' | 'type' | null = null;
    let contextCategorySlug: string | null = null;

    if (slug) {
        const [catMatch, typeMatch] = await Promise.all([
            db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, slug)).limit(1),
            db.select({ slug: productTypes.slug, categorySlug: productTypes.categorySlug })
                .from(productTypes).where(eq(productTypes.slug, slug)).limit(1),
        ]);
        if (catMatch.length) {
            context = 'category';
            contextCategorySlug = slug;
        } else if (typeMatch.length) {
            context = 'type';
            contextCategorySlug = typeMatch[0].categorySlug;
        }
    }

    // Build queries based on context
    const [allBrands, allCategories, allTypes, allBadgeTags, stockCounts] = await Promise.all([
        db.select().from(brands).orderBy(asc(brands.name)),
        context ? Promise.resolve([]) : db.select().from(categories).orderBy(asc(categories.name)),
        context === 'category'
            ? db.select().from(productTypes)
                .where(eq(productTypes.categorySlug, contextCategorySlug!))
                .orderBy(asc(productTypes.name))
            : context === 'type'
                ? Promise.resolve([])
                : db.select().from(productTypes).orderBy(asc(productTypes.name)),
        db.select().from(tags).where(eq(tags.type, 'badge')).orderBy(asc(tags.label)),
        db.select({
            status: products.stockStatus,
            count: count(),
        }).from(products)
            .where(eq(products.isPublished, true))
            .groupBy(products.stockStatus),
    ]);

    // Fetch colors from the colors table, filtered by context + active filters
    const colorConditions = [];

    // If on a category page, show colors for all types in that category
    if (context === 'category' && contextCategorySlug) {
        const typesInCategory = await db.select({ slug: productTypes.slug })
            .from(productTypes).where(eq(productTypes.categorySlug, contextCategorySlug));
        if (typesInCategory.length) {
            colorConditions.push(inArray(colors.productType, typesInCategory.map((t) => t.slug)));
        } else {
            colorConditions.push(eq(colors.productType, '__none__'));
        }
    }
    // If on a type page, show only that type's colors
    else if (context === 'type' && slug) {
        colorConditions.push(eq(colors.productType, slug));
    }

    // Apply active brand/type filters for colors
    if (filterBrands.length) {
        colorConditions.push(inArray(colors.brand, filterBrands));
    }
    if (filterTypes.length) {
        colorConditions.push(inArray(colors.productType, filterTypes));
    }

    const colorRows = colorConditions.length
        ? await db.select().from(colors).where(and(...colorConditions))
        : await db.select().from(colors);

    // Deduplicate by hex (different brand/type combos may share same hex)
    const colorMap = new Map<string, { hex: string }>();
    for (const c of colorRows) {
        const key = c.hex.toUpperCase();
        if (!colorMap.has(key)) {
            colorMap.set(key, { hex: key });
        }
    }
    const uniqueColors = [...colorMap.values()];

    const stockMap = Object.fromEntries(stockCounts.map((s) => [s.status, s.count]));

    return json({
        context,
        contextCategorySlug,
        brands: allBrands.map((b) => ({ slug: b.slug, name: b.name })),
        categories: allCategories.map((c) => ({ slug: c.slug, name: c.name })),
        productTypes: allTypes.map((t) => ({ slug: t.slug, name: t.name, categorySlug: t.categorySlug })),
        badgeTags: allBadgeTags.map((t) => ({ value: t.value, label: t.label })),
        stockOptions: [
            { value: 'in_stock', label: 'In Stock', count: stockMap['in_stock'] ?? 0 },
            { value: 'out_of_stock', label: 'Out of Stock', count: stockMap['out_of_stock'] ?? 0 },
        ],
        colors: uniqueColors,
    });
};
