let bannerData = [
    {
        src: 'banner/ac',
        Type: 'ac',
        msg: 'Stay cool, stay productive.'
    },
    {
        src: 'banner/chimney',
        Type: 'chimney',
        msg: 'Breathe easy with style.'
    },
    {
        src: 'banner/fridge',
        Type: 'fridge',
        msg: 'Freshness at your fingertips.'
    },
    {
        src: 'banner/oven',
        Type: 'oven',
        msg: 'Bake your dreams into reality.'
    },
    {
        src: 'banner/ro',
        Type: 'ro',
        msg: 'Pure water, pure life.'
    },
    {
        src: 'banner/speaker',
        Type: 'speaker',
        msg: 'Sound that moves you.'
    },
    {
        src: 'banner/fan',
        Type: 'fan',
        msg: 'Feel the breeze, embrace the ease.'
    },
    {
        src: 'banner/stove',
        Type: 'stove',
        msg: 'Cook with passion, serve with love.'
    },
    {
        src: 'banner/tv',
        Type: 'tv',
        msg: 'Uncover fresh entertainment.'
    },
    {
        src: 'banner/washing-machine',
        Type: 'washing-machine',
        msg: 'Get ultimate clean with our smart washers!'
    },
    {
        src: 'banner/home-appliances',
        Type: 'home-appliances',
        msg: 'Keep food fresh and family happy.'
    },
    {
        src: 'banner/kitchen-appliances',
        Type: 'kitchen-appliances',
        msg: 'Blend your way to health.'
    },
    {
        src: 'banner/self-care-appliances',
        Type: 'self-care-appliances',
        msg: 'Style your hair with ease.'
    },
    {
        src: 'banner/consumer-electronics',
        Type: 'consumer-electronics',
        msg: 'Boost productivity with tech.'
    }
];


const fetchProductsFiltered = async (
    fetch: typeof globalThis.fetch,
    filterType?: 'category' | 'productType',
    filterValue?: string,
    page: number = 1,
    limit: number = 10,
    excludeProductId?: string,
    minimal?: boolean,
) => {
    try {
        let url = `/api/products?page=${page}&limit=${limit}`;

        if (filterType && filterValue) {
            if (filterType === 'category') {
                url += `&category=${encodeURIComponent(filterValue)}`;
            } else if (filterType === 'productType') {
                url += `&productType=${encodeURIComponent(filterValue)}`;
            } else {
                throw new Error('Invalid filterType provided to fetchProductsFiltered');
            }
        }

        if (excludeProductId) {
            url += `&excludeId=${encodeURIComponent(excludeProductId)}`;
        }
        if (minimal) {
            url += '&minimal=true'
        } 

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch products: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const productsData = await response.json(); 

        return productsData;
    } catch (error) {
        console.error('Error in fetchProductsFiltered:', error);
        throw error;
    }
};

const fetchProductBySrc = async (fetch: typeof globalThis.fetch, productSource: string) => {
    try {
        // Call the new dedicated API endpoint for fetching by src
        // console.log('this is used for calling a single product..', productSource);

        const url = `/api/products/src/${encodeURIComponent(productSource)}`; 
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Product not found, handle this case gracefully
            }
            const errorText = await response.text();
            console.error(`Failed to fetch product by src: ${response.status} - ${errorText}`);
            throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error in fetchProductBySrc:', error);
        throw error;
    }
};

const fetchSearchResult = async (fetch: typeof globalThis.fetch, searchQuery: string) => { 
    const url = `/api/search?searchQuery=${encodeURIComponent(searchQuery)}`


    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        const errorText = await response.text();
        console.error(`no items found`);
        throw new Error(`no items found for this query`);
    }
    const result = (await response.json()).result 
    
    return result;
}

export { bannerData, fetchProductsFiltered, fetchProductBySrc, fetchSearchResult }

