import mongoose, { Document, Schema } from 'mongoose';

// Interface for Order document
export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod?: string;
  sessionId?: string;
  createdAt: Date;
}

// Schema definition
const orderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled']
  },
  shippingAddress: {
    type: String
  },
  billingAddress: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  sessionId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Order model
export const Order = mongoose.model<IOrder>('Order', orderSchema);