import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import Subscription from "@/models/Subscription";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    // Find the subscriber in DB
    const subscriber = await Subscription.findOne({ userId });
    if (!subscriber || !subscriber.customerId) {
      return NextResponse.json(
        { success: false, message: "No subscription found for user" },
        { status: 404 }
      );
    }

    // Create a portal session for the customer
    /* a call to the Stripe API that creates a Customer Portal session. This session returns a secure, one-time-use URL that can be used to redirect the customer to their Stripe-hosted subscription management page.
    This is part of the billingPortal.sessions.create method in the Stripe Node.js SDK. */
    const portalSession = await stripe.billingPortal.sessions.create({
        //customer portal of this customerId created by stripe. stripe will register user when payment done for first time with cusomer is auto generated with stripe and email as name which in this app passed by me. when customerId passed from here stripe looks for that customer id and creates session
      customer: subscriber.customerId,
      // This is the URL the user will be redirected back to after they're done managing their subscription(clicking back to transformai sandbox)
      return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/userdashboard`,
    });

    return NextResponse.json(
      { success: true, url: portalSession.url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}