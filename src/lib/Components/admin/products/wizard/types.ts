export type VariantData = {
	colorName: string;
	hex: string;
	mainImagePath: string;
	mainFileId: string;
	galleryPaths: string[];
	galleryFileIds: string[];
	_pendingMainFile?: File | null;
	_pendingGalleryFiles?: File[] | null;
};

export type ProductFormData = {
	name: string;
	slug: string;
	brand: string;
	description: string;
	categorySlug: string;
	productType: string;
	promotionTag: string | null;
	badgeTag: string | null;
	price: number | null;
	discountPrice: number | null;
	offers: string[];
	whatsappMsg: string;
	specifications: { label: string; value: string }[];
	inTheBox: string[];
	stockStatus: string;
	isHero: boolean;
	variants: VariantData[];
	heroDesktopPath: string;
	heroDesktopFileId: string;
	heroMobilePath: string;
	heroMobileFileId: string;
	isPublished: boolean;
	_pendingHeroDesktopFile?: File | null;
	_pendingHeroMobileFile?: File | null;
};

export type CatalogOption = { slug: string; name: string; categorySlug?: string };

export type StepValidation = { valid: boolean; error?: string };
