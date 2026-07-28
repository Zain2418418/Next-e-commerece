import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from "@/lib/dbConnect";
import Order from '@/models/Order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err: any) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await dbConnect();

      const existingOrder = await Order.findOne({ stripeSessionId: session.id });

      if (!existingOrder) {
        await Order.create({
          customerEmail: session.customer_email || session.customer_details?.email || 'guest@example.com',
          totalAmount: (session.amount_total || 0) / 100,
          paymentMethod: 'Card',
          paymentStatus: 'paid',
          status: 'Processing',
          stripeSessionId: session.id,
          items: [],
        });
      }
    } catch (dbErr) {
      console.error('Failed to save Stripe order in DB:', dbErr);
    }
  }

  return NextResponse.json({ received: true });
}