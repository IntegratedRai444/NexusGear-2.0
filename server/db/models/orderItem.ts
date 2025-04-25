import mongoose, { Document, Schema } from 'mongoose';

// Interface for OrderItem document
export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  createdAt: Date;
}

// Schema definition
const orderItemSchema = new Schema<IOrderItem>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the OrderItem model
export const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);