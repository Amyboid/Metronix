import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

// Define the base product schema
const productSchema = new Schema({ 
    src: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['home-appliances', 'consumer-electronics', 'kitchen-appliances', 'self-care-appliances'], 
        required: true 
    },
    productType: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    InStock: { type: Number, required: true },
    specifications: [
        { label: { type: String, required: true }, value: { type: String, required: true } }
    ],
    InTheBox: { type: [String], required: true },
    offers: { type: [String], required: true }
});
 
const Product = models.Product || model('Product', productSchema);

export default Product;
