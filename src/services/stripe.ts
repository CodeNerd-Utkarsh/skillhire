'use server';

import Stripe from 'stripe';
import { Order as DbOrder, Payment } from '@/models'; // Import Sequelize models
import { sequelize } from '@/lib/db'; // Import Sequelize instance

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET; // Add this to your .env for webhook verification
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

if (!stripeSecretKey) {
  console.warn('Stripe environment variable (STRIPE_SECRET_KEY) is not set. Stripe functionality will be limited.');
}
if (!stripeWebhookSecret) {
    console.warn('Stripe environment variable (STRIPE_WEBHOOK_SECRET) is not set. Webhook verification will be skipped (INSECURE!).');
}


const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20', // Use a fixed API version
  typescript: true,
}) : null;


/**
 * Creates a Stripe Checkout Session for a one-time payment.
 *
 * @param dbOrderId - The ID of the order in your database.
 * @param serviceTitle - The title of the service being purchased.
 * @param amount - The amount in the smallest currency unit (e.g., cents for USD).
 * @param currency - The currency code (e.g., 'usd').
 * @param clientEmail - Optional email for pre-filling Stripe checkout.
 * @returns The Stripe Checkout Session object.
 * @throws Error if Stripe instance is not available or API call fails.
 */
export async function createStripeCheckoutSession(
    dbOrderId: string,
    serviceTitle: string,
    amount: number, // Amount in cents
    currency: string = 'usd',
    clientEmail?: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Missing API key.');
  }

  const successUrl = `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`; // Redirect URL after successful payment
  const cancelUrl = `${appUrl}/order/cancel?order_id=${dbOrderId}`; // Redirect URL if payment is cancelled

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Add other payment methods if needed
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: serviceTitle,
              // Optionally add description or images
              // description: `Order ID: ${dbOrderId}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        databaseOrderId: dbOrderId, // Link to your DB order
      },
      ...(clientEmail && { customer_email: clientEmail }), // Pre-fill email if provided
      // Automatic tax calculation (optional, requires setup in Stripe dashboard)
      // automatic_tax: { enabled: true },
      // Collect shipping address (if needed for the service)
      // shipping_address_collection: { allowed_countries: ['US', 'CA'] },
    });

    console.log('Stripe Checkout Session Created:', session.id);
    return session;
  } catch (error: any) {
    console.error('Error creating Stripe Checkout Session:', error);
    throw new Error(`Failed to create Stripe session: ${error.message || 'Unknown Stripe error'}`);
  }
}


/**
 * Handles Stripe webhook events.
 * Needs to be exposed via an API route (e.g., /api/webhooks/stripe).
 *
 * @param body - The raw request body from Stripe.
 * @param signature - The 'stripe-signature' header value.
 * @returns Object indicating success or failure.
 */
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

    // 1. Verify the webhook signature (IMPORTANT for security)
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
    const dataObject = event.data.object as any; // Type assertion for easier access

    // 2. Process the event
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
                     // Decide how to handle - might wait for payment_intent.succeeded event instead
                     await transaction.rollback();
                     return { received: true, processed: false, error: 'Missing payment intent ID' };
                 }


                const dbOrder = await DbOrder.findByPk(dbOrderId, { transaction });

                if (!dbOrder) {
                    console.warn(`Stripe Webhook: Could not find database order ${dbOrderId} for session ${session.id}.`);
                    await transaction.rollback();
                    return { received: true, processed: false, error: 'Order not found' };
                }

                // Find or create the Payment record
                const [dbPayment] = await Payment.findOrCreate({
                    where: { orderId: dbOrder.id, provider: 'stripe', providerPaymentId: paymentIntentId },
                    defaults: {
                        orderId: dbOrder.id,
                        provider: 'stripe',
                        providerPaymentId: paymentIntentId,
                        amount: session.amount_total ?? 0, // amount_total is in cents
                        currency: session.currency ?? 'usd',
                        status: 'pending', // Initial status, confirm with payment_intent event
                        metadata: session, // Store the session object
                    },
                    transaction
                });

                // Update order status based on session completion (payment might still be processing)
                 if (session.payment_status === 'paid' && dbOrder.status === 'pending') {
                    dbOrder.status = 'in_progress'; // Payment received, start processing
                    await dbOrder.save({ transaction });

                    // Update payment status if it was pending
                    if(dbPayment.status === 'pending') {
                        dbPayment.status = 'succeeded';
                        dbPayment.metadata = session; // Update metadata
                        await dbPayment.save({ transaction });
                    }

                    console.log(`Stripe Webhook: Checkout session ${session.id} completed and paid for order ${dbOrderId}.`);
                    // TODO: Trigger fulfillment logic (e.g., notify freelancer)
                 } else {
                    // Payment might be 'unpaid' or requires action
                     console.log(`Stripe Webhook: Checkout session ${session.id} completed, payment status: ${session.payment_status}. Waiting for payment confirmation.`);
                 }
                break;

             case 'payment_intent.succeeded':
                const paymentIntentSucceeded = dataObject as Stripe.PaymentIntent;
                 const charge = paymentIntentSucceeded.latest_charge ? (typeof paymentIntentSucceeded.latest_charge === 'string' ? paymentIntentSucceeded.latest_charge : paymentIntentSucceeded.latest_charge.id) : null;

                 // Find the payment record using the PaymentIntent ID
                 const succeededPayment = await Payment.findOne({
                     where: { provider: 'stripe', providerPaymentId: paymentIntentSucceeded.id },
                     include: [{ model: DbOrder, as: 'order' }], // Include the associated order
                     transaction
                 });

                if (succeededPayment && succeededPayment.order) {
                    succeededPayment.status = 'succeeded';
                    succeededPayment.metadata = paymentIntentSucceeded; // Update metadata with PI details
                    await succeededPayment.save({ transaction });

                    // Ensure order status is updated if it was still pending
                    if (succeededPayment.order.status === 'pending') {
                        succeededPayment.order.status = 'in_progress';
                        await succeededPayment.order.save({ transaction });
                        console.log(`Stripe Webhook: Order ${succeededPayment.orderId} status updated to in_progress via PaymentIntent.`);
                         // TODO: Trigger fulfillment logic here as well (idempotently)
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
                     failedPayment.metadata = paymentIntentFailed; // Update metadata
                     await failedPayment.save({ transaction });

                     // Optionally update order status to 'failed' or keep as 'pending'
                     // if (failedPayment.order && failedPayment.order.status === 'pending') {
                     //     failedPayment.order.status = 'failed'; // Or cancelled
                     //     await failedPayment.order.save({ transaction });
                     // }

                     console.log(`Stripe Webhook: PaymentIntent ${paymentIntentFailed.id} failed for order ${failedPayment.orderId}. Reason: ${paymentIntentFailed.last_payment_error?.message}`);
                 } else {
                    console.warn(`Stripe Webhook: Received payment_intent.payment_failed for ${paymentIntentFailed.id}, but couldn't find matching payment record.`);
                 }
                 break;

            // --- Handle Refunds (Optional) ---
             case 'charge.refunded':
                const chargeRefunded = dataObject as Stripe.Charge;
                 const refundedPayment = await Payment.findOne({
                    // We stored the PaymentIntent ID, need to find via charge if not directly linked
                    // This might require storing the charge ID in metadata or searching metadata
                     where: { provider: 'stripe', providerPaymentId: chargeRefunded.payment_intent },
                     transaction
                 });

                if (refundedPayment) {
                    refundedPayment.status = 'refunded';
                     // Update metadata, potentially adding refund details
                    refundedPayment.metadata = {
                         ...(refundedPayment.metadata || {}),
                         refund_details: chargeRefunded.refunds?.data, // Store refund info
                     };
                    await refundedPayment.save({ transaction });

                     // Update order status if needed
                    const refundedOrder = await DbOrder.findByPk(refundedPayment.orderId, { transaction });
                    if (refundedOrder) {
                        // Decide appropriate status, e.g., 'cancelled' or a custom 'refunded' status
                        // refundedOrder.status = 'cancelled';
                        // await refundedOrder.save({ transaction });
                    }
                    console.log(`Stripe Webhook: Charge ${chargeRefunded.id} (PI: ${chargeRefunded.payment_intent}) refunded for order ${refundedPayment.orderId}.`);

                } else {
                    console.warn(`Stripe Webhook: Received charge.refunded for ${chargeRefunded.id}, but couldn't find matching payment record via PI ${chargeRefunded.payment_intent}.`);
                }
                 break;

            // --- Add other relevant events as needed ---
            // e.g., 'customer.subscription.deleted', 'invoice.payment_failed'

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


// --- Helper Function (Optional) ---

/**
 * Retrieves a Stripe Checkout Session.
 *
 * @param sessionId - The ID of the Stripe Checkout Session.
 * @returns The Stripe Checkout Session object or null if not found.
 */
export async function getStripeCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    if (!stripe) {
        console.error('Cannot retrieve Stripe session: Stripe not configured.');
        return null;
    }
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent'], // Expand details if needed
        });
        return session;
    } catch (error: any) {
        console.error(`Error retrieving Stripe session ${sessionId}:`, error);
        return null;
    }
}
