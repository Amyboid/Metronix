import Fuse from 'fuse.js';

class FuzzySearcher {
    private fuse : Fuse<any>;
    constructor(essentials:any, options:any) {
        this.fuse = new Fuse(essentials, options);
    }

    fuzzSearch(searchParams:any) {
        const result = this.fuse.search(searchParams);
        return result;
    }

}

export default FuzzySearcher;