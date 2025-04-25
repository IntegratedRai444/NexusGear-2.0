import mongoose, { Document, Schema } from 'mongoose';

// Interface for CartItem document
export interface ICartItem extends Document {
  userId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  sessionId?: string;
  createdAt: Date;
}

// Schema definition
const cartItemSchema = new Schema<ICartItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  sessionId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicates (one product per user/session)
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
cartItemSchema.index({ sessionId: 1, productId: 1 }, { unique: true, sparse: true });

// Create and export the CartItem model
export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);