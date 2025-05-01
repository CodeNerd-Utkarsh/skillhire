import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { handleRazorpayWebhook } from '@/services/razorpay';

export async function POST(request: NextRequest) {
  const signature = headers().get('x-razorpay-signature');
  let body: any;

  try {

    body = await request.json();
  } catch (error: any) {
    console.error('Error parsing Razorpay webhook request body:', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!signature) {
    console.error('Razorpay webhook signature missing.');
    return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
  }

  try {

    const result = await handleRazorpayWebhook(body, signature);

    if (result.error) {
      console.error(`Razorpay Webhook Handler Error: ${result.error}`);

      const status = result.error.toLowerCase().includes('signature') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    console.log('Razorpay webhook processed successfully.');

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Unexpected error in Razorpay webhook processing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
