import mongoose, { Schema, Model, Document } from "mongoose";
// include Document in IUserDocument name
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string; // Optional for Google users
  role: "user" | "admin";
  isVerified: boolean;
  image?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  verificationCodeAttempts: number;
  lockVerificationCodeUntil?: Date;
  verificationResendAttempts: number;
  lockVerificationResendUntil?: Date;
  resetPasswordAttempts: number;
  lockResetPasswordUntil?: Date;
  loginAttempts: number;
  lockLoginUntil?: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: {type: String},
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    isVerified: { type: Boolean, default: false },
     image: { type: String },
    verificationCode: String,
    verificationCodeExpiresAt: Date,
    verificationCodeAttempts: { type: Number, default: 0 },
    lockVerificationCodeUntil: Date,
    verificationResendAttempts: { type: Number, default: 0 },
    lockVerificationResendUntil: Date,
    resetPasswordAttempts: { type: Number, default: 0 },
    lockResetPasswordUntil: Date,
    loginAttempts: { type: Number, default: 0 },
    lockLoginUntil: Date,
  },
  {
    timestamps: true,
  }
);

/*  mongoose.models.User || needed for avoiding error- Runtime OverwriteModelError Cannot overwrite `User` model once compiled in backend code change and actions with session auth to work. 

When you edit a file (like your route.ts), Turbopack reloads only part of the app. That means your User.ts model file is re-imported. Since you’re doing:const User: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema);every reload tries to recompile User, but Mongoose doesn’t allow redefining the same model twice → hence OverwriteModelError.
Fix
Instead of always creating a new model, check if it already exists:
const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);
*/

 const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);

export default User;