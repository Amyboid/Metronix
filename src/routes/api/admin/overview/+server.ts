import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, locations, productAvailability, auditLogs } from '$lib/server/db/schema';
import { count, eq, sql, and, gt, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !['admin', 'super_admin'].includes(locals.user.role ?? '')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const [
		perCategory,
		perType,
		publishedCount,
		unpublishedCount,
		outOfStockCount,
		recentlyAddedCount,
		locationRows,
		// New queries
		totalProductCount,
		inventoryValue,
		lowStockProducts,
		recentActivity,
		brandDistribution,
		stockByLocation,
		categoryHealth,
		promotionTags,
		badgeTags,
	] = await Promise.all([
		// Existing — products per category
		db.select({ categorySlug: products.categorySlug, count: count() })
			.from(products).groupBy(products.categorySlug),

		// Existing — products per type
		db.select({ productType: products.productType, count: count() })
			.from(products).groupBy(products.productType),

		// Existing — total published
		db.select({ count: count() }).from(products).where(eq(products.isPublished, true)),

		// Existing — total unpublished
		db.select({ count: count() }).from(products).where(eq(products.isPublished, false)),

		// Existing — out of stock
		db.select({ count: count() }).from(products).where(eq(products.stockStatus, 'out_of_stock')),

		// Existing — recently added
		db.select({ count: count() }).from(products).where(gt(products.createdAt, sevenDaysAgo)),

		// Existing — all locations
		db.select({
			id: locations.id,
			storeName: locations.storeName,
			address: locations.address,
			city: locations.city,
		}).from(locations),

		// NEW 1 — total product count
		db.select({ count: count() }).from(products),

		// NEW 2 — inventory value (price × stock across all locations)
		db.select({
			total: sql<number>`COALESCE(SUM(${products.price} * ${productAvailability.stockCount}), 0)`,
		})
			.from(products)
			.innerJoin(productAvailability, eq(products.id, productAvailability.productId)),

		// NEW 3 — low stock products (total stock ≤ 3)
		db.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			totalStock: sql<number>`SUM(${productAvailability.stockCount})`,
		})
			.from(products)
			.innerJoin(productAvailability, eq(products.id, productAvailability.productId))
			.groupBy(products.id, products.name, products.slug)
			.having(sql`SUM(${productAvailability.stockCount}) <= 3`)
			.orderBy(sql`SUM(${productAvailability.stockCount}) ASC`)
			.limit(5),

		// NEW 4 — recent admin activity (last 5 audit logs)
		db.select().from(auditLogs)
			.orderBy(desc(auditLogs.createdAt))
			.limit(5),

		// NEW 5 — brand distribution (top 5)
		db.select({ brand: products.brand, count: count() })
			.from(products)
			.groupBy(products.brand)
			.orderBy(desc(count()))
			.limit(5),

		// NEW 6 — stock by location
		db.select({
			storeName: locations.storeName,
			city: locations.city,
			productCount: sql<number>`COUNT(DISTINCT ${productAvailability.productId})`,
			totalStock: sql<number>`COALESCE(SUM(${productAvailability.stockCount}), 0)`,
		})
			.from(locations)
			.leftJoin(productAvailability, eq(locations.id, productAvailability.locationId))
			.groupBy(locations.id, locations.storeName, locations.city),

		// NEW 7 — category health (category × stock status)
		db.select({
			categorySlug: products.categorySlug,
			stockStatus: products.stockStatus,
			count: count(),
		})
			.from(products)
			.groupBy(products.categorySlug, products.stockStatus),

		// NEW 8a — promotion tags
		db.select({ tag: products.promotionTag, count: count() })
			.from(products)
			.where(sql`${products.promotionTag} IS NOT NULL`)
			.groupBy(products.promotionTag),

		// NEW 8b — badge tags
		db.select({ tag: products.badgeTag, count: count() })
			.from(products)
			.where(sql`${products.badgeTag} IS NOT NULL`)
			.groupBy(products.badgeTag),
	]);

	return json({
		// Existing
		perCategory,
		perType,
		published: publishedCount[0]?.count ?? 0,
		unpublished: unpublishedCount[0]?.count ?? 0,
		outOfStock: outOfStockCount[0]?.count ?? 0,
		recentlyAdded: recentlyAddedCount[0]?.count ?? 0,
		locations: {
			count: locationRows.length,
			stores: locationRows,
		},
		// New
		totalProducts: totalProductCount[0]?.count ?? 0,
		inventoryValue: inventoryValue[0]?.total ?? 0,
		lowStockProducts,
		recentActivity,
		brandDistribution,
		stockByLocation,
		categoryHealth,
		promotionTags,
		badgeTags,
	});
};
