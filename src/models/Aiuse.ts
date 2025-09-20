import mongoose, { Schema, Model, Document } from "mongoose";



export interface IAiuseDocument extends Document {
    userId: string;
    prompt?: string;
    content?: string;
    type: string;
    image?: string;
}

const AiuseSchema = new Schema<IAiuseDocument>({
    userId: { type: String, required: true },
    prompt: { type: String },
    content: { type: String },
    type: { type: String, required: true },
    image: { type: String },
    },
  {
    timestamps: true,
  }
);



const Aiuse: Model<IAiuseDocument> = mongoose.models.Aiuse || mongoose.model<IAiuseDocument>("Aiuse", AiuseSchema);


export default Aiuse;