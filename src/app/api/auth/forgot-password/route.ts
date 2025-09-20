import { sendVerificationEmail } from "@/config/sendemail/email";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {email} = await request.json();
    await connectToDatabase();
    const user = await User.findOne({ email});
    if(!user) {
    return NextResponse.json({ success: false, message: 'user not found'}, {status: 404});
    };
    if(!user.isVerified){
       return NextResponse.json({ success: false, message: "email not verified" }, { status: 403 });
    };
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();// random 6 digit
    user.verificationCode = verificationCode
    await user.save();
    await sendVerificationEmail(user.email, verificationCode);
    return NextResponse.json({
      success: true,
      message: "verification code has been sent to your email."},
      { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success:false, error }, { status: 500 });
  }
  };