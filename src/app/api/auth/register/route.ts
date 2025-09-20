// register not provided by nextAuth.js need to create customly
import { sendVerificationEmail } from "@/config/sendemail/email";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // nextjs serverless makes us to receive request as await and json object
    const { firstName, lastName, email, password, role } = await request.json();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  // Validate password using regex
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { success: false,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and be at least 8 characters long.',
    },
      { status: 400 }
    );
}

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        {success: false, message: "All fields are required"},
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email});
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already registered" },
        { status: 400 }
      );
    };
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();// random 6 digit

    const user = await User.create({
      name: firstName + " " + lastName,
      email,
      password: hashedPassword,
      role,
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 1 * 60 * 60 * 1000, //1 hour
    });
    
   await sendVerificationEmail(user.email, verificationCode);
    return NextResponse.json(
      { success: true, 
        message: "Registration successful. Please check your email for verification code.",
       _id: user._id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error", error);
    return NextResponse.json(
      { success: false, error},
      { status: 500 }
    );
  }
}