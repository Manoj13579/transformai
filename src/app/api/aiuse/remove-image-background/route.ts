import cloudinary from "@/config/cloudinary";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Aiuse from "@/models/Aiuse";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    };
     await connectToDatabase();
     const subscriber = await Subscription.findOne({ userId: session.user.id, isSubscribed: true });

     if (!subscriber) {
        return NextResponse.json({ success: false, message: "You are not subscribed" }, { status: 400 });
     };

    // Parse multipart form-data
    const formData = await request.formData();
    const file: File | null = formData.get("image") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert File -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload original image to Cloudinary
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "transformai",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    // Construct background removed URL (on-the-fly)
    const bgRemovedUrl = uploadResponse.secure_url.replace(
      "/upload/",
      "/upload/e_background_removal/"
    );

    // Save record in DB
   
    await Aiuse.create({
      userId: session.user.id,
      prompt: "remove background from image",
      content: bgRemovedUrl,
      type: "remove image background",
    });

    return NextResponse.json(
      { success: true, data: bgRemovedUrl },
      { status: 200 }
    );
  } catch (error) {
    console.log("remove image background error", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
};

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
              return NextResponse.json({ success: false, message: "Unauthorized" },{ status: 403 });
            };
          await connectToDatabase();
          const data = await Aiuse.find({ userId: session.user.id, type: "remove image background" }).sort({ createdAt: -1 });
          return NextResponse.json({ success: true, message:"successfully fetched remove image background", data }, { status: 200 });

    } catch (error) {
        console.error('get remove image background error' ,error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
};


export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const { _id } = await request.json();
        if (!_id) {
            return NextResponse.json(
                { success: false, message: "remove image background ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedBlogTitle = await Aiuse.findByIdAndDelete(_id);

        if (!deletedBlogTitle) {
            return NextResponse.json(
                { success: false, message: "remove image background not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "remove image background deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("delete remove image background error", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
