import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

  export async function POST(request: NextRequest) {
  
  try {
    const {verificationCode, email, password} = await request.json();
  console.log(verificationCode, email, password);
  
  if(!verificationCode || !email || !password) {
  return NextResponse.json({ success: false, message: 'all fields required' }, {status: 403});
  };
 const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  // Validate password using regex
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { success: false,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and be at least 8 characters long.',
    },
      { status: 400 }
    );
};
     await connectToDatabase();
    const user = await User.findOne({ email});
    if (!user) {
      return NextResponse.json({ success: false, message: 'user not found'}, {status: 404});
    };
    // Check if the account is currently locked
    if (user.lockResetPasswordUntil && user.lockResetPasswordUntil.getTime() >= Date.now()) {
      return NextResponse.json({ success: false, message: "Account is locked. Please try again later." }, { status: 403 });
    };
    if(verificationCode !== user.verificationCode) {
      // Increment attempts
      user.resetPasswordAttempts += 1;
      // Lock the account if attempts exceed the maximum limit
      if(user.resetPasswordAttempts >= 3) {
        user.lockResetPasswordUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 1 day
        user.resetPasswordAttempts = 0; // Reset resetPasswordAttempts after locking
      }
      await user.save();
      return NextResponse.json({ success: false, message: 'invalid verification code'}, {status: 404});
    };
    // hash password
     const hashedPassword = await bcrypt.hash(password, 10);
    // Update the user's password
    user.password = hashedPassword;
    user.resetPasswordAttempts = 0; // Reset esetPasswordAttempts after successful password reset
    await user.save();
    return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success:false, error }, { status: 500 });
  }
  };