import ai from "@/config/ai";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { logEvent } from "@/lib/logEvent";
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
            const { prompt, length } = await request.json();
const response = await ai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    /* When temperature is set to a higher value (e.g., 0.8 - 1.0), the model's responses are more varied, creative, and random. This makes the text generation feel more human-like and diverse.When temperature is set to a lower value (e.g., 0.0 - 0.2), the model's responses will be more deterministic, focused, and predictable, often sticking closely to the most likely next word or phraseThe temperature is set to 0.7, meaning the model is expected to generate fairly balanced, creative but not overly random responses. 
    
    max_tokens is a parameter that limits the maximum length of the generated response, in terms of the number of tokens.A token is a chunk of text, which can be a word, part of a word, or even punctuation.
    */
    temperature: 0.7,
    max_tokens: length,
});
    
const content = response.choices[0].message.content;
        await connectToDatabase();
        await Aiuse.create({
            userId: session.user.id,
            prompt,
            content,
            type: "article",
        });
       // log in article generation success
        await logEvent({
            userId: session.user.id,
        userEmail: session.user.email!,
        eventType: "Generate Article Success",
        level: "Info",
        details: `User generated an article`,
        req: request,

        })
        return NextResponse.json({ success: true, data:content }, { status: 200 });

    } catch (error) {
        console.error('generate article error' ,error);
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
          const data = await Aiuse.find({ userId: session.user.id, type: "article" }).sort({ createdAt: -1 });
          return NextResponse.json({ success: true, message:"successfully fetched articles", data }, { status: 200 });

    } catch (error) {
        console.error('get article error' ,error);
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
                { success: false, message: "Article ID is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const deletedBlogTitle = await Aiuse.findByIdAndDelete(_id);

        if (!deletedBlogTitle) {
            return NextResponse.json(
                { success: false, message: "Article not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Article deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("delete article error", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}