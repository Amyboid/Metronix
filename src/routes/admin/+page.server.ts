
import Product from '$lib/models/ProductModel'
import { mkdir, unlink } from 'fs/promises';
import { error, fail } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { writeFile } from "fs/promises";
import { fetchProductsFiltered } from '$lib/data/products';


function removeExtension(filename: string): string {
	const parsedPath = path.parse(filename);
	return parsedPath.name;
}

function getImageSrc(productImage: File, category: string, productType: string) {
	const mapToDir: { [key: string]: string } = {
		'home-appliances': 'homeAppliance',
		'consumer-electronics': 'consumerElectronics',
		'kitchen-appliances': 'kitchen',
		'self-care-appliances': 'selfcare'
	}
	console.log(`Received file: ${productImage.name}, type: ${productImage.type}, size: ${productImage.size} bytes`);
	const uniqueFilename = `${uuidv4()}${path.extname(productImage.name)}`;
	const uploadDir = path.join('static', 'assets', mapToDir[category], productType)
	const filePath = path.join(process.cwd(), uploadDir, uniqueFilename);
	let imageSrc = `${mapToDir[category]}/${productType}/${removeExtension(uniqueFilename)}`

	return {
		imageSrc,
		uploadDir,
		filePath
	}
}

export const actions = {
	create: async ({ request, locals }) => { 
		const userRole = locals.user?.role;
		if (userRole === 'Editor') {
			return fail(401,
				{
					message: 'sorry! you don\'t have the access to add product',
					success: false
				}
			)
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
		let imgSrc;
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
		if (productImage instanceof File && productImage.size > 0) {
			const imageType = productImage.type;

			if (imageType === 'image/png') {
				try {
					let { imageSrc, uploadDir, filePath } = getImageSrc(productImage, category, productType)
					imgSrc = imageSrc
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


		const inTheBoxRaw = formData.get('inTheBox') as string || '';

		const inTheBox = inTheBoxRaw
			.split(/[\n,]/)
			.map(item => item.trim())
			.filter(item => item !== '');

		// specifications
		let specifications: { label: string; value: string }[] = [];
		let specificationsRaw = formData.get('specifications') as string
		if (specificationsRaw) {
			specifications = JSON.parse(specificationsRaw)
		}
		let offers: any = [];
		let offersRaw = formData.get('offers') as string
		if (offersRaw) {
			offers = JSON.parse(offersRaw)
		}

		console.log('specifications', specifications);


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
			message: 'product created successfully',
			success: true
		};
	},


	update: async ({ request, locals }) => {
		const userRole = locals.user?.role;

		if (userRole === 'Editor') {
			return fail(401,
				{
					message: 'sorry! you don\'t have the access to update',
					success: false
				}
			)
		}
		const formData = await request.formData()
		const product_id = formData.get('product_id') as string;
		const name = formData.get('name') as string;
		const priceString = formData.get('price') as string;
		const category = formData.get('category') as string;
		const brand = formData.get('brand') as string;
		const productType = formData.get('productType') as string;
		const description = formData.get('description') as string;
		const inStockString = formData.get('inStock') as string;
		let imgSrc = formData.get('imageSrc') as string;
		console.log("prevSrc: ", imgSrc);

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
		if (productImage instanceof File && productImage.size > 0) {
			const imageType = productImage.type;

			if (imageType === 'image/png') {
				try {
					let { imageSrc, uploadDir, filePath } = getImageSrc(productImage, category, productType)

					const oldImage = path.join(process.cwd(), 'static', 'assets', imgSrc) + '.png';
					console.log('oldimage::', oldImage);

					// delete the old image 
					try {
						await unlink(oldImage)
						console.log('success in deleteing old image');

					} catch (error) {
						console.log('error in deleting file during update', error);
					}

					imgSrc = imageSrc
					try {
						await mkdir(path.join(process.cwd(), uploadDir), { recursive: true });
						await writeFile(filePath, Buffer.from(await productImage.arrayBuffer()));
						console.log('success in updating new image');

					} catch (error) {
						console.log('error in creating file during update', error);

					}
					console.log(`File saved to: ${filePath}`);
				} catch (error) {
					console.error('Error saving image file:', error);
					return fail(500, { message: 'Failed to save product image.' });
				}
			}
			else {
				return fail(415, { message: 'Unsupported Media Type.' });
			}
		}


		const inTheBoxRaw = formData.get('inTheBox') as string || '';

		const inTheBox = inTheBoxRaw
			.split(/[\n,]/)
			.map(item => item.trim())
			.filter(item => item !== '');

		// specifications
		let specifications: { label: string; value: string }[] = [];
		let specificationsRaw = formData.get('specifications') as string
		if (specificationsRaw) {
			specifications = JSON.parse(specificationsRaw)
		}
		let offers: any = [];
		let offersRaw = formData.get('offers') as string
		if (offersRaw) {
			offers = JSON.parse(offersRaw)
		}

		const dataToUpdate = {
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

		try {
			const updatedProduct = await Product.findByIdAndUpdate(product_id, dataToUpdate)
			if (!updatedProduct) {
				return fail(404, { message: "product not found" })
			}

			return {
				message: 'product updated successfully',
				success: true
			};
		} catch (error: any) {
			console.log('error in updatating', error);
			return fail(500, {
				message: error.message || 'Failed to update product due to a server error.',
				success: false
			});
		}
	},

	delete: async ({ request, locals }) => {
		const userRole = locals.user?.role;
		if (userRole === 'Editor') {
			return fail(401,
				{
					message: 'sorry! you don\'t have the access to delete',
					success: false
				}
			)
		}

		const formData = await request.formData();
		const itemId = formData.get('id')
		const imgSrc = formData.get('imgSrc') as string
		const ImageToDelete = path.join(process.cwd(), 'static', 'assets', imgSrc) + '.png';

		try {
			const deletedProduct = await Product.findByIdAndDelete(itemId)
			console.log(deletedProduct);

			if (!deletedProduct) {
				return fail(404, { message: "Product not found" })
			}
		} catch (error: any) {
			console.log('error in deleting product', error);
			return fail(500, {
				message: error.message || 'Failed to delete product due to a server error.',
				success: false
			});
		}

		// delete the image locally 
		try {
			await unlink(ImageToDelete)
			console.log('success in deleteing the product image');

		} catch (error) {
			console.log('error in deleting product image', error);
		}


	}

};



export async function load({ locals, params, fetch, url }) {
	const currentUserRole = locals.user?.role;

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
		totalPages,
		currentUserRole
	};
}
