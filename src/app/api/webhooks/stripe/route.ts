import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { handleStripeWebhook } from '@/services/stripe';

export async function POST(request: NextRequest) {
  const signature = headers().get('stripe-signature');
  let body: Buffer;

  try {

    body = await request.arrayBuffer().then(buffer => Buffer.from(buffer));
  } catch (error: any) {
    console.error('Error reading Stripe webhook request body:', error);
    return NextResponse.json({ error: 'Could not read request body' }, { status: 400 });
  }

  if (!signature) {
    console.error('Stripe webhook signature missing.');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    const result = await handleStripeWebhook(body, signature);

    if (result.error) {
      console.error(`Stripe Webhook Handler Error: ${result.error}`);

      const status = result.error.toLowerCase().includes('signature') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    console.log('Stripe webhook processed successfully.');
    return NextResponse.json({ received: true, processed: result.processed });

  } catch (error: any) {
    console.error('Unexpected error in Stripe webhook processing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
