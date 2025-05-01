import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { handleRazorpayWebhook } from '@/services/razorpay'; // Adjust path as necessary

export async function POST(request: NextRequest) {
  const signature = headers().get('x-razorpay-signature');
  let body: any;

  try {
    // Razorpay typically sends JSON, parse it
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
    // Pass the parsed JSON body and signature to the handler
    const result = await handleRazorpayWebhook(body, signature);

    if (result.error) {
      console.error(`Razorpay Webhook Handler Error: ${result.error}`);
      // Return 400 for signature errors, 500 for processing errors
      const status = result.error.toLowerCase().includes('signature') ? 400 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    console.log('Razorpay webhook processed successfully.');
    // Razorpay expects a 200 OK response to acknowledge receipt
    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Unexpected error in Razorpay webhook processing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
