import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId?: string;
  title: string;
  message: string;
  type: "order" | "info" | "system";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, default: null },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["order", "info", "system"], default: "info" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);