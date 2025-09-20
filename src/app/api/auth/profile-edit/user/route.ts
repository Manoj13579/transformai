import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /* authOptions is your NextAuth configuration object — it tells getServerSession how to check the session. When you set up NextAuth you define things like: Providers (Google, GitHub, Credentials, etc.), Session strategy (jwt or database),Secret key (to sign/verify JWTs or cookies), Callbacks (e.g., modify session object before sending to client).

When you call: getServerSession(authOptions). it:
Reads cookies from the request (in App Router, handled automatically).Uses authOptions.secret to verify the session or JWT signature.Runs any session callbacks you defined in authOptions.Returns the session object or null if the user is not logged in.

Without authOptions, getServerSession wouldn’t know:
How your app authenticates users.How to decode and validate the cookie or JWT.What custom properties to include in session.user.

In short:
authOptions is the blueprint for your authentication system.Passing it to getServerSession ensures that the backend route uses the exact same authentication rules you defined for your whole app. */
    const session = await getServerSession(authOptions);

    if (!session) {
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
    const data = await User.findOneAndUpdate({ _id},updateData,{ new: true });

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
