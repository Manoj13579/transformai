import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { userId: _id, password, image } = await request.json();
    

    // no user or logged-in user does not match his own id. could update someone else’s profile if they knew the ID
    if (!_id || _id !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Request" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  // Validate password using regex
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { success: false,
      message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and be at least 8 characters long.',
    },
      { status: 400 }
    );}
    /**
     * Hash the password before updating if it is provided
     */
    let updateData = { image, password };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await connectToDatabase();
    const data = await User.findOneAndUpdate({ _id, role: "admin" },updateData,{ new: true });

    if (!data) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        { success: true, message: "Profile updated successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in profile update user", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
