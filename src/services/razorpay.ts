'use server';

import Razorpay from 'razorpay';
import { randomUUID } from 'crypto'; // For generating unique receipt IDs
import { Order as DbOrder, Payment } from '@/models'; // Import Sequelize models
import { sequelize } from '@/lib/db'; // Import Sequelize instance

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // For webhook verification and redirects

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn('Razorpay environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not fully set. Razorpay functionality will be limited.');
}

const razorpayInstance = razorpayKeyId && razorpayKeySecret ? new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
}) : null;


/**
 * Creates a Razorpay order.
 *
 * @param dbOrderId - The ID of the order in your database.
 * @param amount - The amount in the smallest currency unit (e.g., paise for INR).
 * @param currency - The currency code (e.g., 'INR').
 * @returns The Razorpay order details.
 * @throws Error if Razorpay instance is not available or API call fails.
 */
export async function createRazorpayOrder(dbOrderId: string, amount: number, currency: string = 'INR'): Promise<Razorpay.Order> {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured. Missing API keys.');
  }

  const options = {
    amount: amount, // Amount in paise
    currency: currency,
    receipt: `receipt_order_${randomUUID()}`, // Unique receipt ID
    notes: {
        databaseOrderId: dbOrderId, // Link to your DB order
    }
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log('Razorpay Order Created:', order);
    return order;
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create Razorpay order: ${error.message || error.description || 'Unknown error'}`);
  }
}

/**
 * Verifies a Razorpay payment signature.
 *
 * @param razorpayOrderId - The Razorpay Order ID.
 * @param razorpayPaymentId - The Razorpay Payment ID.
 * @param razorpaySignature - The signature received from Razorpay.
 * @returns True if the signature is valid, false otherwise.
 */
export function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean {
    if (!razorpayInstance || !razorpayKeySecret) {
        console.error('Cannot verify Razorpay signature: Razorpay not configured.');
        return false;
    }
    try {
        // The SDK handles the crypto generation and comparison
        return Razorpay.utils.validateWebhookSignature(
            JSON.stringify({ order_id: razorpayOrderId, payment_id: razorpayPaymentId }), // Important: Stringify the body if needed or pass raw body
            razorpaySignature,
            razorpayKeySecret // Use the key secret directly
        );
    } catch (error) {
        console.error('Error verifying Razorpay signature:', error);
        return false;
    }
}


/**
 * Handles Razorpay webhook events (e.g., payment success, failure).
 * Needs to be exposed via an API route (e.g., /api/webhooks/razorpay).
 *
 * @param body - The raw request body from Razorpay.
 * @param signature - The 'X-Razorpay-Signature' header value.
 * @returns Object indicating success or failure.
 */
export async function handleRazorpayWebhook(body: any, signature: string | undefined | string[]) {
   if (!razorpayInstance || !razorpayKeySecret) {
    console.error('Cannot handle Razorpay webhook: Razorpay not configured.');
    return { received: false, error: 'Razorpay not configured' };
  }
  if (!signature || Array.isArray(signature)) {
      console.error('Invalid Razorpay signature received.');
      return { received: false, error: 'Invalid signature' };
  }


  // 1. Verify the webhook signature (IMPORTANT for security)
   const isValid = Razorpay.utils.validateWebhookSignature(
      JSON.stringify(body), // Ensure body is stringified correctly if it's JSON
      signature,
      razorpayKeySecret
    );

    if (!isValid) {
        console.error('Invalid Razorpay webhook signature.');
        return { received: false, error: 'Invalid signature' };
    }

    const event = body.event;
    const paymentEntity = body.payload.payment.entity;
    const orderEntity = body.payload.order?.entity; // Order entity might not always be present

    console.log(`Received Razorpay webhook event: ${event}`);


    // 2. Process the event
    const transaction = await sequelize.transaction();
    try {
        let dbOrder: DbOrder | null = null;
        let dbPayment: Payment | null = null;

        // Try finding the order using notes if available
        if (orderEntity?.notes?.databaseOrderId) {
             dbOrder = await DbOrder.findByPk(orderEntity.notes.databaseOrderId, { transaction });
        }
         // Fallback: Find payment first, then order (if order notes weren't available)
        if (!dbOrder && paymentEntity?.id) {
             dbPayment = await Payment.findOne({ where: { provider: 'razorpay', providerPaymentId: paymentEntity.id }, transaction });
             if (dbPayment) {
                dbOrder = await DbOrder.findByPk(dbPayment.orderId, { transaction });
            }
        }


        if (!dbOrder) {
            console.warn(`Razorpay Webhook: Could not find corresponding database order for payment ${paymentEntity?.id} or order ${orderEntity?.id}.`);
             // Depending on your logic, you might still record the payment without an order link, or ignore.
             await transaction.rollback();
             return { received: true, processed: false, error: 'Order not found' };
        }

        // Find or create the Payment record
         if (!dbPayment) {
            dbPayment = await Payment.findOrCreate({
                where: { orderId: dbOrder.id, provider: 'razorpay', providerPaymentId: paymentEntity.id },
                defaults: {
                    orderId: dbOrder.id,
                    provider: 'razorpay',
                    providerPaymentId: paymentEntity.id,
                    amount: paymentEntity.amount,
                    currency: paymentEntity.currency,
                    status: 'pending', // Initial status, update based on event
                    metadata: paymentEntity, // Store the whole payment entity
                },
                transaction
            })[0]; // findOrCreate returns [instance, created]
         }


        // Update Order and Payment status based on the event
        switch (event) {
            case 'payment.captured':
            case 'payment.authorized': // Treat authorized as success for immediate update
                dbOrder.status = 'in_progress'; // Or 'completed' if service delivery is instant
                dbPayment.status = 'succeeded';
                dbPayment.metadata = paymentEntity; // Update metadata
                await dbOrder.save({ transaction });
                await dbPayment.save({ transaction });
                console.log(`Razorpay Webhook: Order ${dbOrder.id} payment succeeded.`);
                // TODO: Trigger fulfillment logic (e.g., notify freelancer)
                break;

            case 'payment.failed':
                // Order status might remain 'pending' or move to 'failed'/'cancelled'
                // dbOrder.status = 'pending'; // Or 'failed'
                dbPayment.status = 'failed';
                dbPayment.metadata = paymentEntity;
                // await dbOrder.save({ transaction }); // Only save if status changed
                await dbPayment.save({ transaction });
                console.log(`Razorpay Webhook: Order ${dbOrder.id} payment failed. Reason: ${paymentEntity.error_description}`);
                break;

            case 'order.paid':
                 // This often confirms the payment for the order was successful
                if (dbOrder.status === 'pending') {
                    dbOrder.status = 'in_progress';
                    await dbOrder.save({ transaction });
                 }
                 if (dbPayment.status !== 'succeeded') {
                     dbPayment.status = 'succeeded';
                     dbPayment.metadata = paymentEntity; // Update with order payment details if needed
                     await dbPayment.save({ transaction });
                 }
                 console.log(`Razorpay Webhook: Order ${dbOrder.id} marked as paid.`);
                 // TODO: Trigger fulfillment logic
                 break;

            // --- Handle Refunds (Optional) ---
            case 'refund.processed':
                 const refundEntity = body.payload.refund.entity;
                 // Find the original payment
                 const originalPaymentForRefund = await Payment.findOne({
                     where: { provider: 'razorpay', providerPaymentId: refundEntity.payment_id },
                     transaction
                 });
                 if (originalPaymentForRefund) {
                     originalPaymentForRefund.status = 'refunded';
                     // You might add refund details to metadata or a separate Refund model
                     originalPaymentForRefund.metadata = {
                        ...(originalPaymentForRefund.metadata || {}),
                         refund: refundEntity
                     };
                     await originalPaymentForRefund.save({ transaction });
                     // Update order status if necessary (e.g., to 'cancelled' or 'refunded')
                     const refundedOrder = await DbOrder.findByPk(originalPaymentForRefund.orderId, { transaction });
                     if(refundedOrder) {
                        // Decide appropriate status, e.g., 'cancelled'
                        // refundedOrder.status = 'cancelled';
                        // await refundedOrder.save({ transaction });
                     }
                     console.log(`Razorpay Webhook: Refund processed for payment ${refundEntity.payment_id}.`);
                 } else {
                    console.warn(`Razorpay Webhook: Could not find original payment for refund ${refundEntity.id}`);
                 }
                 break;

            // --- Add other relevant events as needed ---

            default:
                console.log(`Razorpay Webhook: Unhandled event type: ${event}`);
        }

        await transaction.commit();
        return { received: true, processed: true };

    } catch (error: any) {
        await transaction.rollback();
        console.error(`Razorpay Webhook Error processing event ${body?.event}:`, error);
        return { received: true, processed: false, error: error.message || 'Internal server error' };
    }
}
