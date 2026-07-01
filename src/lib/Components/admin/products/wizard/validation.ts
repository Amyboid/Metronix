import type { ProductFormData, StepValidation } from './types';

export function validateStep1(data: ProductFormData): StepValidation {
	if (!data.name.trim()) return { valid: false, error: 'Product name is required' };
	if (!data.slug.trim()) return { valid: false, error: 'Slug is required' };
	if (!data.brand) return { valid: false, error: 'Brand is required' };
	if (!data.description.trim()) return { valid: false, error: 'Description is required' };
	if (!data.categorySlug) return { valid: false, error: 'Category is required' };
	if (!data.productType) return { valid: false, error: 'Product type is required' };
	return { valid: true };
}

export function validateStep2(data: ProductFormData): StepValidation {
	if (!data.price || data.price <= 0) return { valid: false, error: 'Price is required and must be greater than 0' };
	if (data.discountPrice && data.discountPrice >= data.price)
		return { valid: false, error: 'Discount price must be less than the original price' };
	return { valid: true };
}

export function validateStep3(_data: ProductFormData): StepValidation {
	return { valid: true };
}

export function validateStep4(
	data: ProductFormData,
	fileState: { hasNewMain: boolean; newGalleryCount: number }[]
): StepValidation {
	if (data.variants.length === 0) return { valid: false, error: 'Add at least one color variant' };

	for (let i = 0; i < data.variants.length; i++) {
		const v = data.variants[i];
		const fs = fileState[i] ?? { hasNewMain: false, newGalleryCount: 0 };
		if (!v.colorName.trim()) return { valid: false, error: `Variant ${i + 1}: color name required` };
		if (!v.hex) return { valid: false, error: `Variant ${i + 1}: hex color required` };
		if (!v.mainImagePath && !fs.hasNewMain)
			return { valid: false, error: `Variant ${i + 1}: main image required` };
		const totalGallery = v.galleryPaths.length + fs.newGalleryCount;
		if (totalGallery < 4)
			return { valid: false, error: `Variant ${i + 1}: needs at least 4 gallery images (${totalGallery}/4)` };
		if (totalGallery > 6)
			return { valid: false, error: `Variant ${i + 1}: max 6 gallery images` };
	}
	return { valid: true };
}

export function validateStep5(_data: ProductFormData): StepValidation {
	return { valid: true };
}

export const STEP_VALIDATORS = [validateStep1, validateStep2, validateStep3, validateStep4, validateStep5];
export const STEP_LABELS = ['Basic Info', 'Pricing', 'Details', 'Variants', 'Publish'];

export function validateStep(
	step: number,
	data: ProductFormData,
	fileState?: { hasNewMain: boolean; newGalleryCount: number }[]
): StepValidation {
	const validator = STEP_VALIDATORS[step - 1];
	if (!validator) return { valid: true };
	if (step === 4 && fileState) return validateStep4(data, fileState);
	return validator(data);
}
