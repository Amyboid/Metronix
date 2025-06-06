import { essentials, productBannerData } from '$lib/itemData';
export function load({ params }) {
    const productType = params.slug;
    const items = essentials.filter((item) => item.productType === params.slug)
    const banner = productBannerData.find((item) => item.productType === params.slug)
    console.log('items', items);
    
    return {
        items,
        banner,
        productType      
    };
}