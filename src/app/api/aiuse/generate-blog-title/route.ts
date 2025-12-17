import ai from "@/config/ai";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Aiuse from "@/models/Aiuse";
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
            const { prompt } = await request.json();
const response = await ai.chat.completions.create({
    model: "gemini-2.5-flash-lite",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature: 0.7
});
    
const content = response.choices[0].message.content;
        await connectToDatabase();
        await Aiuse.create({
            userId: session.user.id,
            prompt,
            content,
            type: "blog title",
        });
       
        return NextResponse.json({ success: true, data:content }, { status: 200 });

    } catch (error) {
        console.error('generate blog title error' ,error);
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
          const data = await Aiuse.find({ userId: session.user.id, type: "blog title" }).sort({ createdAt: -1 });
          return NextResponse.json({ success: true, message:"successfully fetched blog titles", data }, { status: 200 });

    } catch (error) {
        console.error('get blog title error' ,error);
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
                { success: false, message: "Blog title ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedBlogTitle = await Aiuse.findByIdAndDelete(_id);

        if (!deletedBlogTitle) {
            return NextResponse.json(
                { success: false, message: "Blog title not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Blog title deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("delete blog title error", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}