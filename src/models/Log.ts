import mongoose, { Schema, Model, Document } from "mongoose";

export interface ILogDocument extends Document {
  userId?: string;
  userEmail?: string;
  eventType: string;
  level: "Info" | "Warning" | "Error" | "Debug";
  details?: string;
  ip?: string;
  browser?: string;
  createdAt: Date;
  updatedAt: Date;
}
// only eventType is required. so display any data if provided.
const LogSchema = new Schema<ILogDocument>(
  {
    userId: { type: String },
    userEmail: { type: String },
    eventType: { type: String, required: true },
    level: { type: String, enum: ["Info", "Warning", "Error", "Debug"], default: "Info" },// if no level is provided categorize it as Info
    details: { type: String },
    ip: { type: String },
    browser: { type: String },
  },
  { timestamps: true }
);

const Log: Model<ILogDocument> =
  mongoose.models.Log || mongoose.model<ILogDocument>("Log", LogSchema);

export default Log;
