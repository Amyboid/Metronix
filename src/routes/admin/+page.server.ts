
import Product from '$lib/models/ProductModel'
import { mkdir } from 'fs/promises';
import { error, fail } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { writeFile } from "fs/promises";
import { fetchProductsFiltered } from '$lib/data/products';


function removeExtension(filename: string): string {
	const parsedPath = path.parse(filename);
	return parsedPath.name;
}
export const actions = {
	create: async ({ request }) => {
		const mapToDir: { [key: string]: string } = {
			'home-appliances': 'homeAppliance',
			'consumer-electronics': 'consumerElectronics',
			'kitchen-appliances': 'kitchen',
			'self-care-appliances': 'selfcare'
		}


		const formData = await request.formData()
		console.log("formdata: ", formData.entries());

		const name = formData.get('name') as string;
		const priceString = formData.get('price') as string;
		const category = formData.get('category') as string;
		const brand = formData.get('brand') as string;
		const productType = formData.get('productType') as string;
		const description = formData.get('description') as string;
		const inStockString = formData.get('inStock') as string;

		const price = parseFloat(priceString);
		const inStock = parseInt(inStockString, 10);

		if (!name || name.trim() === '') {
			return fail(400, { name, message: 'Product name is required.' });
		}
		if (isNaN(price) || price <= 0) {
			return fail(400, { price, message: 'Valid price is required.' });
		}
		if (!category || category.trim() === '') {
			return fail(400, { category, message: 'Category is required.' });
		}
		if (!brand || brand.trim() === '') {
			return fail(400, { brand, message: 'Brand is required.' });
		}
		if (!productType || productType.trim() === '') {
			return fail(400, { productType, message: 'Product type is required.' });
		}
		if (isNaN(inStock) || inStock < 0) {
			return fail(400, { inStock, message: 'Valid stock quantity is required.' });
		}


		const productImage = formData.get('productImage');
		let imgSrc;
		if (productImage instanceof File && productImage.size > 0) {
			const imageType = productImage.type;
			console.log(`Received file: ${productImage.name}, type: ${productImage.type}, size: ${productImage.size} bytes`);
			if (imageType === 'image/png') {
				const uniqueFilename = `${uuidv4()}${path.extname(productImage.name)}`;
				const uploadDir = path.join('static', 'assets', mapToDir[category], productType)
				const filePath = path.join(process.cwd(), uploadDir, uniqueFilename);
				imgSrc = `${mapToDir[category]}/${productType}/${removeExtension(uniqueFilename)}`

				try {

					await mkdir(path.join(process.cwd(), uploadDir), { recursive: true });
					await writeFile(filePath, Buffer.from(await productImage.arrayBuffer()));

					console.log(`File saved to: ${filePath}`);
				} catch (error) {
					console.error('Error saving image file:', error);
					return fail(500, { message: 'Failed to save product image.' });
				}
			}
			else {
				return fail(415, { message: 'Unsupported Media Type.' });
			}
		} else {
			console.log('No image file uploaded or file is empty.');
			return fail(400, { productImage, message: 'ProductImage is required.' });
		}

		// specifications
		const specifications: { label: string; value: string }[] = [];
		const groupedSpecs: { [index: string]: { label?: string; value?: string } } = {};

		for (const [key, value] of formData.entries()) {
			const match = key.match(/specifications\[(\d+)\].(label|value)/)
			if (match) {
				const index = match[1];
				const type = match[2];
				if (!groupedSpecs[index]) {
					groupedSpecs[index] = {}
				}
				groupedSpecs[index][type as 'label' | 'value'] = value
			}
		}

		Object.keys(groupedSpecs)
			.sort((a, b) => parseInt(a) - parseInt(b))
			.forEach(index => {
				const spec = groupedSpecs[index];
				if (spec.label !== undefined && spec.value !== undefined) {
					specifications.push({ label: spec.label, value: spec.value });
				}
			});

		const inTheBoxRaw = formData.get('inTheBox') as string || '';
		const offersRaw = formData.get('offers') as string || '';

		const inTheBox = inTheBoxRaw
			.split(/[\n,]/) // Split by newline or comma
			.map(item => item.trim()) // Trim whitespace from each item
			.filter(item => item !== ''); // Remove any empty strings

		const offers = offersRaw
			.split(/[\n,]/)
			.map(item => item.trim())
			.filter(item => item !== '');


		const dataToUpload = {
			src: imgSrc,
			name: name.trim(),
			price: price,
			category: category.trim(),
			productType: productType.trim(),
			brand: brand.trim(),
			description: description.trim(),
			inStock: inStock,
			specifications: specifications,
			inTheBox: inTheBox,
			offers: offers,
		};

		console.log('Final Product Data for DB upload:', dataToUpload);

		const response = await Product.create(dataToUpload);
		console.log("resp db", response);


		return {
			success: true
		};
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const itemId = data.get('id')
		console.log("itemId: ", itemId);

	},
	update: async ({ request }) => {
		const data = await request.formData();
		console.log("update data: ", data);

	}

};



export async function load({ params, fetch, url }) {
 
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '8');

	let responseData;
	try {
		responseData = await fetchProductsFiltered(fetch, undefined, undefined, page, limit);

	} catch (err) {
		console.error('Failed to load filtered products:', err);
	}

	const items = responseData.products;
	const currentLimit = responseData.limit;
	const totalProducts = responseData.totalProducts;
	const totalPages = responseData.totalPages;


	return {
		items,
		limit: currentLimit,
		totalProducts,
		totalPages
	};
}
