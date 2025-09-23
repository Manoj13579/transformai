import { stripe } from "@/lib/stripe";
import Subscription from "@/models/Subscription";
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/db";
import { logEvent } from "@/lib/logEvent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await connectToDatabase();

  const body = await request.text();
  /* signature from stripe is important for security and only form of authentication for stripe webhook. since we cannot give our authentication coz stripe is a third party request and can't send cookie with it.
  When you set up a webhook in the Stripe Dashboard, Stripe generates a unique webhook secret for your endpoint which we also used here in env. This secret is shared between Stripe and your application. signature created using this secret and hashed using HMAC-SHA256 algorithm. stripe dashboard uses these to create signature and webhook here uses these to verify signature.  */

  /* Will Stripe Webhook Requests Be Blocked by Cross-Origin Policy?
The Cross-Origin Resource Sharing (CORS) policy governs how browsers allow web pages to make requests to different origins.
Nature of Stripe Webhook Requests
Stripe webhooks are server-to-server HTTP POST requests sent directly from Stripe's servers to your webhook endpoint (e.g., https://your-domain.com/api/webhooks/stripe).
These requests are not initiated by a browser, so they are not subject to CORS policies. CORS is a browser security mechanism that applies to client-side JavaScript (e.g., fetch or XMLHttpRequest) making cross-origin requests.Since Stripe's requests originate from their servers (not a browser), they bypass CORS entirely. */
  const signature = request.headers.get("Stripe-Signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, message: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
// stripe signature verification
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error("Error verifying Stripe webhook signature:", error);
    return NextResponse.json(
      { success: false, message: "Invalid Stripe signature" },
      { status: 400 }
    );
  }

  const eventType = event.type;
  const data = event.data;

  try {
    if (eventType === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        (data.object as any).id,
        /*When you retrieve a session with stripe.checkout.sessions.retrieve(), by default, you might not get detailed information about the products in the session. For example, you may not immediately have access to the line items (products or services) that the customer has purchased.
        The expand option allows you to request additional nested data that is not included by default in the response. By specifying expand: ["line_items"], you’re telling Stripe to include the line items (prices, quantity) in the response when you retrieve the checkout session. 
        line items is from checkoutSession in route.ts/subscription */
        { expand: ["line_items"] }
      );
      console.log("stripe session completed webhook ", session);
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      const priceId = session.line_items?.data[0]?.price?.id;
      const metadata = (event.data.object as any)?.metadata;

      if (
        priceId !== process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID &&
        priceId !== process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID
      ) {
        console.warn("Price ID mismatch:", priceId);
        return NextResponse.json(
          { success: false, message: "Invalid Price ID" },
          { status: 400 }
        );
      }

      if (metadata?.userId) {
        /* we are using findOneAndUpdate instead if create new user is when user deletes subscription we are saving customerId in database so we don't need to create new document for already subscribed user when he subscribes again. if subsriber is for first time upsert: true ceates new document.   */
        const updatedSubscriber = await Subscription.findOneAndUpdate(
          { userId: metadata.userId },
          {
            isSubscribed: true,
            customerId,
          },
          { 
            new: true,
             upsert: true // Create new document if it doesn't exist
           }
        );

        if (!updatedSubscriber) {
          console.error("User not found for subscription:", metadata.userId);
        } else {
          console.log("User subscription activated:", metadata.userId);
          /* here we don't have acces to email so not sending. can query by id and get email but not doing it. it's okay don't need to send each data. also not sending req for ip and browser coz here request comes from stripe and not user so not used. */
          await logEvent({
            userId: metadata.userId,
            eventType: "Stripe Checkout Completed",
            level: "Info",
            details: "User subscription activated successfully",
          });

        }
      }
    }

    if (eventType === "customer.subscription.deleted") {
      const subscription = data.object as Stripe.Subscription;
      console.log('stripe subscription deleted webhook ', subscription);
      
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const priceId = subscription.items.data[0].price.id;

      if (
        priceId !== process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID &&
        priceId !== process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID
      ) {
        console.warn("Price ID mismatch on cancellation:", priceId);
        return NextResponse.json(
          { success: false, message: "Invalid Price ID" },
          { status: 400 }
        );
      }

      const updatedSubscriber = await Subscription.findOneAndUpdate(
        { customerId },
        { isSubscribed: false },
        { new: true }
      );

      if (!updatedSubscriber) {
        console.error("No subscriber found for customer:", customerId);
      } else {
        console.log("Subscription cancelled for:", customerId);
        // log for subscription cancelled/deleted
        await logEvent({
          eventType: "Stripe Subscription Cancelled",
          level: "Info",
          details: `Subscription cancelled for customerId: ${customerId}`,
        });

      }
    }
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return NextResponse.json(
      { success: false, message: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Webhook processed" },
    { status: 200 }
  );
}