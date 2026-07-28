import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  customerEmail?: string;
  items: IOrderItem[];
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus?: "pending" | "paid" | "failed";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  stripeSessionId?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    customerEmail: { type: String },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        name: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      phone: { type: String },
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    stripeSessionId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);