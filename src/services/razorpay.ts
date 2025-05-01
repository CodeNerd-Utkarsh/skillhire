'use server';

import Razorpay from 'razorpay';
import { randomUUID } from 'crypto';
import { Order as DbOrder, Payment } from '@/models';
import { sequelize } from '@/lib/db';
import crypto from 'crypto';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';


if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn('Razorpay environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not fully set. Razorpay functionality will be limited.');
}
if (!razorpayWebhookSecret) {
    console.warn('Razorpay environment variable (RAZORPAY_WEBHOOK_SECRET) is not set. Webhook verification will be skipped (INSECURE!).');
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
 * @param currency - The currency code (defaults to 'INR').
 * @returns The created Razorpay order object.
 * @throws Error if Razorpay is not configured or the API call fails.
 */
export async function createRazorpayOrder(dbOrderId: string, amount: number, currency: string = 'INR'): Promise<Razorpay.Order> {
  if (!razorpayInstance) {
    throw new Error('Razorpay is not configured. Missing API keys.');
  }

  const options = {
    amount: amount,
    currency: currency,
    receipt: `receipt_order_${randomUUID()}`,
    notes: {
        databaseOrderId: dbOrderId,
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
 * Verifies a Razorpay payment signature (used client-side typically after redirect, less secure than webhooks).
 * This function MUST be async because the 'use server' directive marks all exports as Server Actions.
 * @param razorpayOrderId - The order ID from Razorpay.
 * @param razorpayPaymentId - The payment ID from Razorpay.
 * @param razorpaySignature - The signature received from Razorpay.
 * @returns True if the signature is valid, false otherwise.
 */
export async function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): Promise<boolean> {
     if (!razorpayKeySecret) {
         console.error('Cannot verify Razorpay signature: Razorpay Key Secret not configured.');
         return false;
     }
    try {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(body.toString())
            .digest("hex");
        return expectedSignature === razorpaySignature;
    } catch (error) {
        console.error('Error verifying Razorpay signature:', error);
        return false;
    }
}


/**
 * Handles Razorpay webhook events (e.g., payment success, failure).
 * Needs to be exposed via an API route (e.g., /api/webhooks/razorpay).
 * @param body - The parsed JSON body from the webhook request.
 * @param signature - The 'x-razorpay-signature' header value.
 * @returns Object indicating success or failure and appropriate status code.
 */
export async function handleRazorpayWebhook(body: any, signature: string | undefined | string[]) {
   if (!razorpayInstance || !razorpayWebhookSecret) {
    console.error('Cannot handle Razorpay webhook: Razorpay not configured or webhook secret missing.');
    return { received: false, error: 'Razorpay not configured', status: 500 };
  }
  if (!signature || Array.isArray(signature)) {
      console.error('Invalid Razorpay signature received in webhook.');
      return { received: false, error: 'Invalid signature', status: 400 };
  }


  // 1. Verify the webhook signature (IMPORTANT for security)
   const isValid = Razorpay.utils.validateWebhookSignature(
      JSON.stringify(body),
      signature,
      razorpayWebhookSecret
    );

    if (!isValid) {
        console.error('Invalid Razorpay webhook signature.');
        return { received: true, processed: false, error: 'Invalid signature', status: 400 };
    }

    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;
    const orderEntity = body.payload?.order?.entity;

    if (!event || !body.payload) {
         console.error('Invalid Razorpay webhook payload structure.');
         return { received: true, processed: false, error: 'Invalid payload', status: 400 };
    }


    console.log(`Received Razorpay webhook event: ${event}`);


    // 2. Process the event
    const transaction = await sequelize.transaction();
    try {
        let dbOrder: DbOrder | null = null;
        let dbPayment: Payment | null = null;
        const razorpayPaymentId = paymentEntity?.id;
        const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;


        if (orderEntity?.notes?.databaseOrderId) {
             dbOrder = await DbOrder.findByPk(orderEntity.notes.databaseOrderId, { transaction });
        }
        if (!dbOrder && razorpayPaymentId) {
             dbPayment = await Payment.findOne({ where: { provider: 'razorpay', providerPaymentId: razorpayPaymentId }, transaction });
             if (dbPayment) {
                dbOrder = await DbOrder.findByPk(dbPayment.orderId, { transaction });
            }
        }
         if (!dbOrder && paymentEntity?.notes?.databaseOrderId) {
             dbOrder = await DbOrder.findByPk(paymentEntity.notes.databaseOrderId, { transaction });
         }


        if (!dbOrder) {
            console.warn(`Razorpay Webhook: Could not find corresponding database order for Razorpay payment ${razorpayPaymentId} or order ${razorpayOrderId}.`);
             await transaction.rollback();
             return { received: true, processed: false, error: 'Order not found', status: 200 };
        }


         if (razorpayPaymentId) {
             const [foundOrCreatedPayment] = await Payment.findOrCreate({
                 where: { orderId: dbOrder.id, provider: 'razorpay', providerPaymentId: razorpayPaymentId },
                 defaults: {
                     orderId: dbOrder.id,
                     provider: 'razorpay',
                     providerPaymentId: razorpayPaymentId,
                     amount: paymentEntity.amount,
                     currency: paymentEntity.currency,
                     status: 'pending',
                     metadata: paymentEntity,
                 },
                 transaction
             });
             dbPayment = foundOrCreatedPayment;
         } else if (event === 'order.paid' && orderEntity) {
             const [foundOrCreatedPayment] = await Payment.findOrCreate({
                  where: { orderId: dbOrder.id, provider: 'razorpay'},
                  defaults: {
                      orderId: dbOrder.id,
                      provider: 'razorpay',
                      providerPaymentId: `order_${orderEntity.id}`,
                      amount: orderEntity.amount_paid,
                      currency: orderEntity.currency,
                      status: 'pending',
                      metadata: orderEntity,
                  },
                  transaction
             });
              dbPayment = foundOrCreatedPayment;
         }


        if (!dbPayment) {
             console.warn(`Razorpay Webhook: Could not find or create payment record for order ${dbOrder.id} and event ${event}.`);
             await transaction.rollback();
             return { received: true, processed: false, error: 'Payment record handling failed', status: 200 };
         }


        let fulfillmentRequired = false;
        switch (event) {
            case 'payment.captured':
            case 'payment.authorized':
                if (dbOrder.status === 'pending') {
                    dbOrder.status = 'in_progress';
                    await dbOrder.save({ transaction });
                    fulfillmentRequired = true;
                 }
                if (dbPayment.status !== 'succeeded') {
                    dbPayment.status = 'succeeded';
                    dbPayment.metadata = paymentEntity;
                    await dbPayment.save({ transaction });
                 }
                console.log(`Razorpay Webhook: Order ${dbOrder.id} payment ${razorpayPaymentId} ${event}.`);
                break;

            case 'payment.failed':
                 dbPayment.status = 'failed';
                 dbPayment.metadata = paymentEntity;
                 await dbPayment.save({ transaction });
                 console.log(`Razorpay Webhook: Order ${dbOrder.id} payment ${razorpayPaymentId} failed. Reason: ${paymentEntity?.error_description}`);
                 break;

             case 'order.paid':
                 if (dbOrder.status === 'pending') {
                     dbOrder.status = 'in_progress';
                     await dbOrder.save({ transaction });
                      fulfillmentRequired = true;
                  }
                  if (dbPayment.status !== 'succeeded') {
                      dbPayment.status = 'succeeded';
                      if (paymentEntity) dbPayment.metadata = paymentEntity;
                      else if (orderEntity) dbPayment.metadata = { ...(dbPayment.metadata || {}), order_paid: orderEntity };
                      await dbPayment.save({ transaction });
                  }
                  console.log(`Razorpay Webhook: Order ${dbOrder.id} marked as paid via order.paid event.`);
                  break;

            case 'refund.processed':
                 const refundEntity = body.payload?.refund?.entity;
                 if (!refundEntity || !refundEntity.payment_id) {
                      console.warn('Razorpay Webhook: Invalid refund entity in refund.processed event.');
                      break;
                 }
                 const originalPaymentForRefund = await Payment.findOne({
                     where: { provider: 'razorpay', providerPaymentId: refundEntity.payment_id },
                     transaction
                 });
                 if (originalPaymentForRefund) {
                     originalPaymentForRefund.status = 'refunded';
                     originalPaymentForRefund.metadata = {
                        ...(originalPaymentForRefund.metadata || {}),
                         refund: refundEntity
                     };
                     await originalPaymentForRefund.save({ transaction });

                     const refundedOrder = await DbOrder.findByPk(originalPaymentForRefund.orderId, { transaction });
                     if(refundedOrder && refundedOrder.status !== 'cancelled') {
                        refundedOrder.status = 'cancelled';
                        await refundedOrder.save({ transaction });
                     }
                     console.log(`Razorpay Webhook: Refund ${refundEntity.id} processed for payment ${refundEntity.payment_id}.`);
                 } else {
                    console.warn(`Razorpay Webhook: Could not find original payment for refund ${refundEntity.id}`);
                 }
                 break;

            default:
                console.log(`Razorpay Webhook: Unhandled event type: ${event}`);
        }

        await transaction.commit();

        if (fulfillmentRequired) {
            console.log(`Placeholder: Trigger fulfillment for Order ID: ${dbOrder.id}`);
        }

        return { received: true, processed: true, status: 200 };

    } catch (error: any) {
        await transaction.rollback();
        console.error(`Razorpay Webhook Error processing event ${event}:`, error);
        return { received: true, processed: false, error: error.message || 'Internal server error', status: 500 };
    }
}
