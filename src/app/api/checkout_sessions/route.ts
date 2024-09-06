import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
})

// Define a type for the plan
type PlanType = 'pro' | 'proPlus';

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    // Ensure plan is of type PlanType
    if (!['pro', 'proPlus'].includes(plan)) {
      return new NextResponse(JSON.stringify({ error: { message: 'Invalid plan selected' } }), {
        status: 400,
      });
    }

    // Define pricing details for each plan
    const pricing: Record<PlanType, { unit_amount: number; product_name: string }> = {
      pro: {
        unit_amount: 999, // $9.99 in cents
        product_name: 'Pro subscription',
      },
      proPlus: {
        unit_amount: 1999, // $19.99 in cents
        product_name: 'Pro Plus subscription',
      },
    };

    const selectedPricing = pricing[plan as PlanType];

    const referer = req.headers.get('referer') || 'http://localhost:3000/';

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPricing.product_name,
            },
            unit_amount: selectedPricing.unit_amount,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${referer}result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${referer}result?session_id={CHECKOUT_SESSION_ID}`,
    };

    // Create the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create(params);

    // Return the session as a JSON response
    return new NextResponse(JSON.stringify(checkoutSession), {
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return new NextResponse(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
    });
  }
}
