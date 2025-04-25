import mongoose, { Document, Schema } from 'mongoose';

// Interface for Category document
export interface ICategory extends Document {
  name: string;
  displayName: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
}

// Schema definition
const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  icon: {
    type: String
  }
});

// Create and export the Category model
export const Category = mongoose.model<ICategory>('Category', categorySchema);