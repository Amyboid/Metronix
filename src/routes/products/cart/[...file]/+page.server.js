import { essentials} from '$lib/itemData';
import { error } from '@sveltejs/kit';
export function load({ params }) { 
    const item = essentials.find((item) => item.name === params.file)  
    console.log("itemsh",item);
    if (!item) {
        throw error(404, 'Product not found');
    }
    
    return {
        item
    };
}