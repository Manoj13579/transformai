import { sendVerificationEmail } from "@/config/sendemail/email";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    
    try {
      const { _id } = await request.json();
      await connectToDatabase();
      const user = await User.findById(_id);
      
      if (!user) {
          return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      if (user.isVerified) {
          return NextResponse.json({ success: false, message: "You are already verified" }, { status: 400 });
      }

      // Check if the user is in the lock period. this works in nextjs.
      if (user.lockVerificationResendUntil && user.lockVerificationResendUntil > new Date()) {
          return NextResponse.json({ success: false, message: "Maximum resend attempts reached, try again later" }, { status: 403 });
      }

      if (user.verificationResendAttempts >= 3) {
          user.lockVerificationResendUntil = new Date(Date.now() + 1 * 60 * 1000); // Lock for 1 day
          user.verificationResendAttempts = 0;// Reset verificationCodeAttempts after locking
          await user.save();
          
          return NextResponse.json({ success: false, message: "Maximum resend attempts reached" }, { status: 403 });
      }

      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = newVerificationCode;
      user.verificationCodeExpiresAt = new Date (Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiration
      user.verificationResendAttempts += 1;

      await user.save();
      
      await sendVerificationEmail(user.email, newVerificationCode);

      return NextResponse.json({
          success: true,
          message: "New verification code sent to your email"},
      { status: 200 }
      );
  } catch (error) {
      console.error("resendVerificationCode error", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
  }
};