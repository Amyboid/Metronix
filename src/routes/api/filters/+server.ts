import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { brands, categories, productTypes, tags, products, colors, brandProductTypes } from '$lib/server/db/schema';
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

    // Determine active type filter (from URL params or page context)
    const activeTypeFilter = filterTypes.length ? filterTypes[0] : (context === 'type' ? slug : null);
    // Determine active brand filter (from URL params)
    const activeBrandFilter = filterBrands.length ? filterBrands[0] : null;

    // ── Brands: filtered by active type via junction table ──
    let filteredBrands;
    if (activeTypeFilter) {
        // Only brands that serve this product type
        filteredBrands = await db.select({ slug: brands.slug, name: brands.name })
            .from(brands)
            .innerJoin(brandProductTypes, eq(brands.slug, brandProductTypes.brand))
            .where(eq(brandProductTypes.productType, activeTypeFilter))
            .orderBy(asc(brands.name));
    } else {
        filteredBrands = await db.select({ slug: brands.slug, name: brands.name })
            .from(brands).orderBy(asc(brands.name));
    }

    // ── Categories ──
    const allCategories = context
        ? []
        : await db.select().from(categories).orderBy(asc(categories.name));

    // ── Product Types: filtered by active brand via junction table ──
    let filteredTypes;
    if (context === 'type') {
        filteredTypes = [];
    } else if (context === 'category') {
        let typesQ = db.select().from(productTypes)
            .where(eq(productTypes.categorySlug, contextCategorySlug!))
            .orderBy(asc(productTypes.name));
        // If brand is also selected, further filter by brand×type junction
        if (activeBrandFilter) {
            const typesForBrand = await db.select({ productType: brandProductTypes.productType })
                .from(brandProductTypes)
                .where(eq(brandProductTypes.brand, activeBrandFilter));
            const typeSlugs = typesForBrand.map((t) => t.productType);
            if (typeSlugs.length) {
                filteredTypes = await db.select().from(productTypes)
                    .where(and(
                        eq(productTypes.categorySlug, contextCategorySlug!),
                        inArray(productTypes.slug, typeSlugs)
                    ))
                    .orderBy(asc(productTypes.name));
            } else {
                filteredTypes = [];
            }
        } else {
            filteredTypes = await typesQ;
        }
    } else if (activeBrandFilter) {
        // On home page with brand selected — show only types served by that brand
        const typesForBrand = await db.select({ productType: brandProductTypes.productType })
            .from(brandProductTypes)
            .where(eq(brandProductTypes.brand, activeBrandFilter));
        const typeSlugs = typesForBrand.map((t) => t.productType);
        filteredTypes = typeSlugs.length
            ? await db.select().from(productTypes)
                .where(inArray(productTypes.slug, typeSlugs))
                .orderBy(asc(productTypes.name))
            : [];
    } else {
        filteredTypes = await db.select().from(productTypes).orderBy(asc(productTypes.name));
    }

    // ── Badge tags ──
    const allBadgeTags = await db.select().from(tags)
        .where(eq(tags.type, 'badge')).orderBy(asc(tags.label));

    // ── Stock counts ──
    const stockCounts = await db.select({
            status: products.stockStatus,
            count: count(),
        }).from(products)
            .where(eq(products.isPublished, true))
            .groupBy(products.stockStatus);

    // ── Colors (filtered by context + active brand/type, with product counts) ──
    const colorConditions = [];
    if (context === 'category' && contextCategorySlug) {
        const typesInCategory = await db.select({ slug: productTypes.slug })
            .from(productTypes).where(eq(productTypes.categorySlug, contextCategorySlug));
        if (typesInCategory.length) {
            colorConditions.push(inArray(colors.productType, typesInCategory.map((t) => t.slug)));
        } else {
            colorConditions.push(eq(colors.productType, '__none__'));
        }
    } else if (context === 'type' && slug) {
        colorConditions.push(eq(colors.productType, slug));
    }
    if (filterBrands.length) {
        colorConditions.push(inArray(colors.brand, filterBrands));
    }
    if (filterTypes.length) {
        colorConditions.push(inArray(colors.productType, filterTypes));
    }

    const colorRows = colorConditions.length
        ? await db.select().from(colors).where(and(...colorConditions))
        : await db.select().from(colors);

    // Deduplicate by hex, keeping name and counting products
    const colorMap = new Map<string, { hex: string; name: string; count: number }>();
    for (const c of colorRows) {
        const key = c.hex.toUpperCase();
        if (!colorMap.has(key)) {
            colorMap.set(key, { hex: key, name: c.name, count: 0 });
        }
    }

    // Count products per color (from products.colors JSONB)
    const uniqueColors = [...colorMap.values()];
    if (uniqueColors.length) {
        const allProducts = await db.select({ colors: products.colors })
            .from(products)
            .where(eq(products.isPublished, true));

        for (const p of allProducts) {
            const productColors = p.colors as { name: string; hex: string }[] | null;
            if (!productColors?.length) continue;
            for (const pc of productColors) {
                const key = pc.hex.toUpperCase();
                const entry = colorMap.get(key);
                if (entry) entry.count++;
            }
        }
    }

    const stockMap = Object.fromEntries(stockCounts.map((s) => [s.status, s.count]));

    return json({
        context,
        contextCategorySlug,
        brands: filteredBrands,
        categories: allCategories,
        productTypes: filteredTypes,
        badgeTags: allBadgeTags.map((t) => ({ value: t.value, label: t.label })),
        stockOptions: [
            { value: 'in_stock', label: 'In Stock', count: stockMap['in_stock'] ?? 0 },
            { value: 'out_of_stock', label: 'Out of Stock', count: stockMap['out_of_stock'] ?? 0 },
        ],
        colors: uniqueColors,
    });
};
