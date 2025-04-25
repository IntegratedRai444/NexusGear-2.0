import mongoose, { Document, Schema } from 'mongoose';

// Interface for Product document
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  imageUrl: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  // The interface must match the schema keys
  // isNew is renamed to avoid collision with Mongoose's reserved keyword
  isNewProduct?: boolean;
  isFeatured?: boolean;
  createdAt: Date;
}

// Schema definition
const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    min: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Product model
export const Product = mongoose.model<IProduct>('Product', productSchema);