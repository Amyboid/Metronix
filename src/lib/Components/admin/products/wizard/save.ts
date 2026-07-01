import { uploadToIK } from '$lib/utils/imagekit';
import type { ProductFormData } from './types';

export async function uploadVariantImages(
	data: ProductFormData,
	folder: string
): Promise<{
	colorName: string;
	hex: string;
	mainImagePath: string;
	mainFileId: string;
	galleryPaths: string[];
	galleryFileIds: string[];
}[]> {
	const results = [];

	for (let i = 0; i < data.variants.length; i++) {
		const v = data.variants[i];
		let mainImagePath = v.mainImagePath;
		let mainFileId = v.mainFileId ?? '';
		let galleryPaths = [...v.galleryPaths];
		let galleryFileIds = [...(v.galleryFileIds ?? [])];

		const pendingMain = v._pendingMainFile;
		if (pendingMain) {
			const result = await uploadToIK(pendingMain, folder);
			mainImagePath = result.filePath;
			mainFileId = result.fileId;
		}

		const pendingGallery = v._pendingGalleryFiles;
		if (pendingGallery?.length) {
			for (const file of pendingGallery) {
				const result = await uploadToIK(file, folder);
				galleryPaths.push(result.filePath);
				galleryFileIds.push(result.fileId);
			}
		}

		results.push({
			colorName: v.colorName,
			hex: v.hex,
			mainImagePath,
			mainFileId,
			galleryPaths,
			galleryFileIds,
		});
	}

	return results;
}

export async function uploadHeroImages(
	data: ProductFormData,
	folder: string
): Promise<{
	heroDesktopPath: string;
	heroDesktopFileId: string;
	heroMobilePath: string;
	heroMobileFileId: string;
}> {
	let heroDesktopPath = data.heroDesktopPath;
	let heroDesktopFileId = data.heroDesktopFileId;
	let heroMobilePath = data.heroMobilePath;
	let heroMobileFileId = data.heroMobileFileId;

	const pendingDesktop = data._pendingHeroDesktopFile;
	if (pendingDesktop) {
		const result = await uploadToIK(pendingDesktop, folder);
		heroDesktopPath = result.filePath;
		heroDesktopFileId = result.fileId;
	}

	const pendingMobile = data._pendingHeroMobileFile;
	if (pendingMobile) {
		const result = await uploadToIK(pendingMobile, folder);
		heroMobilePath = result.filePath;
		heroMobileFileId = result.fileId;
	}

	return { heroDesktopPath, heroDesktopFileId, heroMobilePath, heroMobileFileId };
}

export function buildProductPayload(
	data: ProductFormData,
	savedVariants: {
		colorName: string;
		hex: string;
		mainImagePath: string;
		mainFileId: string;
		galleryPaths: string[];
		galleryFileIds: string[];
	}[],
	heroResult: {
		heroDesktopPath: string;
		heroDesktopFileId: string;
		heroMobilePath: string;
		heroMobileFileId: string;
	},
	productId: string
) {
	const firstVariant = savedVariants[0];
	return {
		...(productId ? { id: productId } : {}),
		name: data.name.trim(),
		slug: data.slug.trim(),
		brand: data.brand,
		description: data.description.trim(),
		categorySlug: data.categorySlug,
		productType: data.productType,
		promotionTag: data.promotionTag,
		badgeTag: data.badgeTag,
		price: data.price,
		discountPrice: data.discountPrice,
		offers: data.offers.filter((o: string) => o.trim()),
		whatsappMsg: data.whatsappMsg.trim() || null,
		specifications: data.specifications.filter(
			(s: { label: string; value: string }) => s.label.trim() || s.value.trim()
		),
		inTheBox: data.inTheBox.filter((i: string) => i.trim()),
		stockStatus: data.stockStatus,
		isHero: data.isHero,
		mainImagePath: firstVariant?.mainImagePath ?? '',
		galleryPaths: firstVariant?.galleryPaths ?? [],
		heroDesktopPath: heroResult.heroDesktopPath || null,
		heroDesktopFileId: heroResult.heroDesktopFileId || null,
		heroMobilePath: heroResult.heroMobilePath || null,
		heroMobileFileId: heroResult.heroMobileFileId || null,
		colors: data.variants.map((v) => ({ name: v.colorName, hex: v.hex })),
		isPublished: data.isPublished,
		variants: savedVariants,
	};
}

export async function submitProduct(
	data: ProductFormData,
	productId: string
): Promise<{ ok: boolean; error?: string }> {
	const variantFolder =
		data.categorySlug && data.productType
			? `assets/${data.categorySlug}/${data.productType}`
			: 'assets/misc';

	const heroFolder = data.categorySlug ? `assets/${data.categorySlug}/hero` : 'assets/hero';

	const [savedVariants, heroResult] = await Promise.all([
		uploadVariantImages(data, variantFolder),
		data.isHero ? uploadHeroImages(data, heroFolder) : Promise.resolve({
			heroDesktopPath: data.heroDesktopPath,
			heroDesktopFileId: data.heroDesktopFileId,
			heroMobilePath: data.heroMobilePath,
			heroMobileFileId: data.heroMobileFileId,
		}),
	]);

	const payload = buildProductPayload(data, savedVariants, heroResult, productId);

	const method = productId ? 'PATCH' : 'POST';
	const res = await fetch('/api/admin/products', {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({ message: 'Save failed' }));
		return { ok: false, error: body.message };
	}

	return { ok: true };
}
