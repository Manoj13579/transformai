import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Log from "@/models/Log";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched logs",
        data: {
          logs,
          total,
          page,
          pages: Math.ceil(total / limit)
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("admin dashboard get logs error", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}