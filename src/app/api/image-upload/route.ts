import cloudinary from "@/config/cloudinary";
import { authOptions } from "@/lib/auth";
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
        }


    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({success: false, message: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (1MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File size should be less than 1 MB" }, { status: 400 });
    }

    /* file.arrayBuffer()-This is a method on the File object (from the Web API) that reads the file’s contents and returns a promise that resolves with an ArrayBuffer.ArrayBuffer is a raw binary representation of the file's data.In simpler terms, This line reads the uploaded image file into memory as raw binary data */
    const arrayBuffer = await file.arrayBuffer();
    /*Buffer.from(arrayBuffer)-Node.js doesn’t use ArrayBuffer directly for binary operations.Instead, it uses a class called Buffer.So this line converts the ArrayBuffer into a Node.js Buffer. 
    Why is this needed?
Cloudinary’s upload_stream API expects a binary stream of the image.You:Receive a File object from a FormData request.Convert it into a binary format (ArrayBuffer ➝ Buffer).Send it into the Cloudinary stream (uploadStream.end(buffer)) below.*/
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using upload_stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "transformai",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded to Cloudinary successfully",
      data: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error}, { status: 500 });
  }
}
