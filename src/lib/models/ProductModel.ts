import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

export interface ProductType {
    _id?: string; // Mongoose adds _id automatically, and it's an ObjectId which converts to string
    src: string;
    name: string;
    price: number;
    category: 'home-appliances' | 'consumer-electronics' | 'kitchen-appliances' | 'self-care-appliances';
    productType: string;
    brand: string;
    description: string;
    inStock: number;
    specifications: { label: string; value: string }[];
    inTheBox: string[];  
    offers: string[];  
    createdAt?: Date; 
    updatedAt?: Date; 
}
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
    inStock: { type: Number, required: true },
    specifications: [
        { label: { type: String, required: true }, value: { type: String, required: true } }
    ],
    inTheBox: { type: [String], required: true },
    offers: { type: [String], required: true }
});

const Product = models.Product || model('Product', productSchema);

export default Product;
