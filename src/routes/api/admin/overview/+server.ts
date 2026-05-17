import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products, locations } from '$lib/server/db/schema';
import { count, eq, sql, and, gt } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	// Auth guard — must be admin or super_admin
	if (!locals.user || !['admin', 'super_admin'].includes(locals.user.role ?? '')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	// Run all queries in parallel
	const [
		perCategory,
		perType,
		publishedCount,
		unpublishedCount,
		outOfStockCount,
		recentlyAddedCount,
		locationRows,
	] = await Promise.all([
		// Products per category
		db
			.select({
				categorySlug: products.categorySlug,
				count: count(),
			})
			.from(products)
			.groupBy(products.categorySlug),

		// Products per type
		db
			.select({
				productType: products.productType,
				count: count(),
			})
			.from(products)
			.groupBy(products.productType),

		// Total published
		db
			.select({ count: count() })
			.from(products)
			.where(eq(products.isPublished, true)),

		// Total unpublished
		db
			.select({ count: count() })
			.from(products)
			.where(eq(products.isPublished, false)),

		// Out of stock
		db
			.select({ count: count() })
			.from(products)
			.where(eq(products.stockStatus, 'out_of_stock')),

		// Recently added (last 7 days)
		db
			.select({ count: count() })
			.from(products)
			.where(gt(products.createdAt, sevenDaysAgo)),

		// All locations (id + storeName + address + city)
		db
			.select({
				id: locations.id,
				storeName: locations.storeName,
				address: locations.address,
				city: locations.city,
			})
			.from(locations),
	]);

	return json({
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
	});
};