import cloudinary from "@/config/cloudinary";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Aiuse from "@/models/Aiuse";
import Subscription from "@/models/Subscription";
import axios from "axios";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" },{ status: 403 });};

             await connectToDatabase();
             const subscriber = await Subscription.findOne({ userId: session.user.id, isSubscribed: true }
             );

             if (!subscriber) {
                return NextResponse.json({ success: false, message: "You are not subscribed" }, { status: 400 });
            };

        const { prompt } = await request.json();
        const formData = new FormData()
        formData.append('prompt', prompt)
       const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY,},
            responseType: 'arraybuffer',
        });
         const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const response = await cloudinary.uploader.upload(base64Image, {
      folder: "transformai",
      resource_type: "image",
    });

       
        await Aiuse.create({
            userId: session.user.id,
            prompt,
            image: response.secure_url,
            type: "generate image"
        });
        return NextResponse.json({ success: true, data: response.secure_url }, { status: 200 });

    } catch (error) {
        console.log('generate image error',error);
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
          const data = await Aiuse.find({ userId: session.user.id, type: "generate image" }).sort({ createdAt: -1 });
          return NextResponse.json({ success: true, message:"successfully fetched generate images", data }, { status: 200 });

    } catch (error) {
        console.error('get generate image error' ,error);
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
                { success: false, message: "generate image is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedBlogTitle = await Aiuse.findByIdAndDelete(_id);

        if (!deletedBlogTitle) {
            return NextResponse.json(
                { success: false, message: "generate image not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "generate image deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("delete generate image error", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}