import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISubscriptionDocument extends Document {
  userId: string;
  isSubscribed?: boolean;
  customerId?: string;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: String, required: true },
    isSubscribed: { type: Boolean },
    customerId: { type: String },
  },
  {
    timestamps: true,
  }
);

const Subscription: Model<ISubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscriptionDocument>("Subscription", SubscriptionSchema);

export default Subscription;