import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
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

    const body = await request.json();
    const { userId, email, priceId } = body as {
      userId: string;
      email: string;
      priceId: string;
    };

    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { success: false, message: "Missing required params" },
        { status: 400 }
      );
    }

    // Allow only your official Stripe price IDs
    const validPriceIds = [
      process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID,
      process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID,
    ];

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Price ID" },
        { status: 400 }
      );
    }

    // Check if customer already exists in Stripe
    const existingCustomer = await stripe.customers.list({
      email,
      limit: 1,
    });
/* if user already has a stripe subscription or deleted subscription,  get the customerID. if not, create a new customer with customerID otherwise use the existing customerId */
    let customerId =
      existingCustomer.data.length > 0 ? existingCustomer.data[0].id : null;

    if (!customerId) {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
     payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { userId },
      mode: "subscription",
      billing_address_collection: "required",
      /* customer_update  makes sure that the customer’s profile on Stripe is updated with the information entered during the checkout process. If you want to collect and save the name and address from the customer during the checkout, setting name and address to "auto" will ensure that this data is stored in the Stripe customer object.
      This is especially useful if you need the most up-to-date customer information after they complete the checkout process (e.g., to send invoices or manage subscriptions). */
      customer_update: {
        name: "auto",
        address: "auto",
      },
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/subscription/payments/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/subscription/payments/cancel`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subscription created successfully",
        data: checkoutSession.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Stripe subscription error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
