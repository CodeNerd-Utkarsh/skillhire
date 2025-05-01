
'use server';

import { Order as DbOrder } from '@/models';
import { sequelize } from '@/lib/db';
import { z } from 'zod';
import type { UserPayload } from '@/lib/auth';

const CreateOrderSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  freelancerId: z.string().uuid("Invalid freelancer ID"),
  serviceId: z.string().uuid("Invalid service ID"),
  totalAmount: z.number().int().min(500, "Total amount must be at least 500 cents ($5.00)"),
  requirements: z.string().optional().nullable(),
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;


export async function createOrder(input: CreateOrderInput): Promise<{ order?: DbOrder; error?: string }> {
  const validatedFields = CreateOrderSchema.safeParse(input);

  if (!validatedFields.success) {
    console.error("Order creation validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      error: "Invalid input data for creating order.",

    };
  }

  const transaction = await sequelize.transaction();

  try {
    const newOrder = await DbOrder.create(
      {
        clientId: validatedFields.data.clientId,
        freelancerId: validatedFields.data.freelancerId,
        serviceId: validatedFields.data.serviceId,
        totalAmount: validatedFields.data.totalAmount,
        requirements: validatedFields.data.requirements,
        status: 'pending',
      },
      { transaction }
    );

    await transaction.commit();
    console.log('Database order created successfully:', newOrder.id);
    return { order: newOrder };
  } catch (error: any) {
    await transaction.rollback();
    console.error("Failed to create order in database:", error);
     if (error.name === 'SequelizeForeignKeyConstraintError') {
         return { error: "Invalid client, freelancer, or service ID provided." };
     }
    return { error: "An unexpected error occurred while creating the order." };
  }
}


