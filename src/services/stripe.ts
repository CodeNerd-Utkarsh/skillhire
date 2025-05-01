'use server';

import Stripe from 'stripe';
import { Order as DbOrder, Payment } from '@/models';
import { sequelize } from '@/lib/db';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

if (!stripeSecretKey) {
  console.warn('Stripe environment variable (STRIPE_SECRET_KEY) is not set. Stripe functionality will be limited.');
}
if (!stripeWebhookSecret) {
    console.warn('Stripe environment variable (STRIPE_WEBHOOK_SECRET) is not set. Webhook verification will be skipped (INSECURE!).');
}


const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
}) : null;



export async function createStripeCheckoutSession(
    dbOrderId: string,
    serviceTitle: string,
    amount: number,
    currency: string = 'usd',
    clientEmail?: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Missing API key.');
  }

  const successUrl = `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/order/cancel?order_id=${dbOrderId}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceTitle,


            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        databaseOrderId: dbOrderId,
      },
      ...(clientEmail && { customer_email: clientEmail }),


    });

    console.log('Stripe Checkout Session Created:', session.id);
    return session;
  } catch (error: any) {
    console.error('Error creating Stripe Checkout Session:', error);
    throw new Error(`Failed to create Stripe session: ${error.message || 'Unknown Stripe error'}`);
  }
}



export async function handleStripeWebhook(body: Buffer | string, signature: string | undefined | string[]) {
   if (!stripe || !stripeWebhookSecret) {
    console.error('Cannot handle Stripe webhook: Stripe or webhook secret not configured.');
    return { received: false, error: 'Stripe not configured' };
   }
   if (!signature || Array.isArray(signature)) {
       console.error('Invalid Stripe signature received.');
       return { received: false, error: 'Invalid signature' };
   }

    let event: Stripe.Event;


    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            stripeWebhookSecret
        );
    } catch (err: any) {
        console.error(`❌ Stripe webhook signature verification failed: ${err.message}`);
        return { received: false, error: `Webhook Error: ${err.message}` };
    }

    console.log(`Received Stripe webhook event: ${event.type}`);
    const dataObject = event.data.object as any;


    const transaction = await sequelize.transaction();
    try {

        switch (event.type) {
            case 'checkout.session.completed':
                const session = dataObject as Stripe.Checkout.Session;
                const dbOrderId = session.metadata?.databaseOrderId;
                const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

                if (!dbOrderId) {
                     console.warn(`Stripe Webhook: Missing databaseOrderId in checkout session metadata for session ${session.id}.`);
                     await transaction.rollback();
                     return { received: true, processed: false, error: 'Missing order ID in metadata' };
                }
                 if (!paymentIntentId) {
                     console.warn(`Stripe Webhook: Missing payment_intent ID in checkout session ${session.id}.`);

                     await transaction.rollback();
                     return { received: true, processed: false, error: 'Missing payment intent ID' };
                 }


                const dbOrder = await DbOrder.findByPk(dbOrderId, { transaction });

                if (!dbOrder) {
                    console.warn(`Stripe Webhook: Could not find database order ${dbOrderId} for session ${session.id}.`);
                    await transaction.rollback();
                    return { received: true, processed: false, error: 'Order not found' };
                }


                const [dbPayment] = await Payment.findOrCreate({
                    where: { orderId: dbOrder.id, provider: 'stripe', providerPaymentId: paymentIntentId },
                    defaults: {
                        orderId: dbOrder.id,
                        provider: 'stripe',
                        providerPaymentId: paymentIntentId,
                        amount: session.amount_total ?? 0,
                        currency: session.currency ?? 'usd',
                        status: 'pending',
                        metadata: session,
                    },
                    transaction
                });


                 if (session.payment_status === 'paid' && dbOrder.status === 'pending') {
                    dbOrder.status = 'in_progress';
                    await dbOrder.save({ transaction });


                    if(dbPayment.status === 'pending') {
                        dbPayment.status = 'succeeded';
                        dbPayment.metadata = session;
                        await dbPayment.save({ transaction });
                    }

                    console.log(`Stripe Webhook: Checkout session ${session.id} completed and paid for order ${dbOrderId}.`);

                 } else {

                     console.log(`Stripe Webhook: Checkout session ${session.id} completed, payment status: ${session.payment_status}. Waiting for payment confirmation.`);
                 }
                break;

             case 'payment_intent.succeeded':
                const paymentIntentSucceeded = dataObject as Stripe.PaymentIntent;
                 const charge = paymentIntentSucceeded.latest_charge ? (typeof paymentIntentSucceeded.latest_charge === 'string' ? paymentIntentSucceeded.latest_charge : paymentIntentSucceeded.latest_charge.id) : null;


                 const succeededPayment = await Payment.findOne({
                     where: { provider: 'stripe', providerPaymentId: paymentIntentSucceeded.id },
                     include: [{ model: DbOrder, as: 'order' }],
                     transaction
                 });

                if (succeededPayment && succeededPayment.order) {
                    succeededPayment.status = 'succeeded';
                    succeededPayment.metadata = paymentIntentSucceeded;
                    await succeededPayment.save({ transaction });


                    if (succeededPayment.order.status === 'pending') {
                        succeededPayment.order.status = 'in_progress';
                        await succeededPayment.order.save({ transaction });
                        console.log(`Stripe Webhook: Order ${succeededPayment.orderId} status updated to in_progress via PaymentIntent.`);

                    }
                     console.log(`Stripe Webhook: PaymentIntent ${paymentIntentSucceeded.id} succeeded for order ${succeededPayment.orderId}. Charge: ${charge}`);

                } else {
                    console.warn(`Stripe Webhook: Received payment_intent.succeeded for ${paymentIntentSucceeded.id}, but couldn't find matching payment or order record.`);
                }
                break;

            case 'payment_intent.payment_failed':
                 const paymentIntentFailed = dataObject as Stripe.PaymentIntent;
                 const failedPayment = await Payment.findOne({
                     where: { provider: 'stripe', providerPaymentId: paymentIntentFailed.id },
                     include: [{ model: DbOrder, as: 'order' }],
                     transaction
                 });

                 if (failedPayment) {
                     failedPayment.status = 'failed';
                     failedPayment.metadata = paymentIntentFailed;
                     await failedPayment.save({ transaction });





                     console.log(`Stripe Webhook: PaymentIntent ${paymentIntentFailed.id} failed for order ${failedPayment.orderId}. Reason: ${paymentIntentFailed.last_payment_error?.message}`);
                 } else {
                    console.warn(`Stripe Webhook: Received payment_intent.payment_failed for ${paymentIntentFailed.id}, but couldn't find matching payment record.`);
                 }
                 break;



             case 'charge.refunded':
                const chargeRefunded = dataObject as Stripe.Charge;
                 const refundedPayment = await Payment.findOne({


                     where: { provider: 'stripe', providerPaymentId: chargeRefunded.payment_intent },
                     transaction
                 });

                if (refundedPayment) {
                    refundedPayment.status = 'refunded';

                    refundedPayment.metadata = {
                         ...(refundedPayment.metadata || {}),
                         refund_details: chargeRefunded.refunds?.data,
                     };
                    await refundedPayment.save({ transaction });


                    const refundedOrder = await DbOrder.findByPk(refundedPayment.orderId, { transaction });
                    if (refundedOrder) {


                    }
                    console.log(`Stripe Webhook: Charge ${chargeRefunded.id} (PI: ${chargeRefunded.payment_intent}) refunded for order ${refundedPayment.orderId}.`);

                } else {
                    console.warn(`Stripe Webhook: Received charge.refunded for ${chargeRefunded.id}, but couldn't find matching payment record via PI ${chargeRefunded.payment_intent}.`);
                }
                 break;





            default:
                console.log(`Stripe Webhook: Unhandled event type ${event.type}`);
        }

        await transaction.commit();
        return { received: true, processed: true };

    } catch (error: any) {
        await transaction.rollback();
        console.error(`Stripe Webhook Error processing event ${event?.type}:`, error);
        return { received: true, processed: false, error: error.message || 'Internal server error' };
    }
}





export async function getStripeCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    if (!stripe) {
        console.error('Cannot retrieve Stripe session: Stripe not configured.');
        return null;
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent'],
        });
        return session;
    } catch (error: any) {
        console.error(`Error retrieving Stripe session ${sessionId}:`, error);
        return null;
    }
}
