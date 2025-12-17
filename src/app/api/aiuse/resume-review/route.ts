import ai from "@/config/ai";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Aiuse from "@/models/Aiuse";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
/* below // @ts-ignore ignores typescript type need for line below it. pdf-parse can't be used as it is like import pdfParse from "pdf-parse" coz not well maintained so importing this way from it's definition. can't use default import so  "@types/pdf-parse": "^1.1.5", won't work. we are using pdf-parse as it is easy to use. Buffer() is deprecated due to security warning is from this package so ignore it.*/
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";




export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse multipart form-data
    const formData = await request.formData();
    const file: File | null = formData.get("resume") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
  return NextResponse.json({ success: false, message: "Only PDF files are allowed" }, { status: 400 });
}

// Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File size should be less than 5 MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer);
     const pdfData = await pdfParse(buffer);


    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement in 250 words. Resume content: \n\n${pdfData.text}`

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
      prompt: 'Review uploaded resume',
      content,
      type: "resume review",
    });

    return NextResponse.json(
      { success: true, data: content },
      { status: 200 }
    );
  } catch (error) {
    console.log("resume review error", error);
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
          const data = await Aiuse.find({ userId: session.user.id, type: "resume review" }).sort({ createdAt: -1 });
          return NextResponse.json({ success: true, message:"successfully fetched resume review", data }, { status: 200 });

    } catch (error) {
        console.error('get resume review error' ,error);
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
                { success: false, message: "resume review ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedBlogTitle = await Aiuse.findByIdAndDelete(_id);

        if (!deletedBlogTitle) {
            return NextResponse.json(
                { success: false, message: "resume review not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "resume review deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("delete resume review error", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}