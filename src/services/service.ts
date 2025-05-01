
'use server';

import { Service, User } from '@/models';
import { cookies } from 'next/headers';
import { verifyToken, type UserPayload } from '@/lib/auth';
import { Op } from 'sequelize';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const ServiceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(80, "Title cannot exceed 80 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().int().min(500, "Price must be at least $5.00 (500 cents)"),
  deliveryTime: z.coerce.number().int().min(1, "Delivery time must be at least 1 day"),
  revisions: z.coerce.number().int().min(0, "Revisions cannot be negative"),
  status: z.enum(['active', 'paused', 'draft']).optional().default('draft'),
});

const EditServiceSchema = ServiceSchema.extend({
    id: z.string().uuid("Invalid service ID"),
});

async function getUserFromCookie(): Promise<UserPayload | null> {
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) {
        return null;
    }
    return await verifyToken(token);
}


async function handleImageUpload(imageFile: File | null): Promise<string | null> {
    if (!imageFile) return null;


    console.log(`Simulating upload for: ${imageFile.name}, size: ${imageFile.size}`);
    const fileExtension = imageFile.name.split('.').pop();
    const uniqueFilename = `${randomUUID()}.${fileExtension}`;


    const width = 800;
    const height = 600;

    const seed = uniqueFilename.substring(0, 10);
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export async function createService(formData: FormData) {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'freelancer') {
        return { error: "Unauthorized: Only freelancers can create services." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File | null;


    const validatedFields = ServiceSchema.safeParse(rawData);

    if (!validatedFields.success) {
        console.error("Service validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Invalid input data.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }
     if (!imageFile || imageFile.size === 0) {
         return { error: "Service image is required." };
     }


    try {
        const imageUrl = await handleImageUpload(imageFile);



        const newService = await Service.create({
            ...validatedFields.data,
            imageUrl: imageUrl,
            freelancerId: user.id,
        });

        console.log("Service created:", newService.id);
        return { success: true, service: newService.toJSON() };

    } catch (error: any) {
        console.error("Service creation error:", error);
         if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map((e: any) => ({ field: e.path, message: e.message }));
            return { error: "Validation failed.", details: errors };
        }
        return { error: "An unexpected error occurred during service creation. Please try again." };
    }
}

export async function getServiceForEditById(serviceId: string): Promise<Service | null> {
     const user = await getUserFromCookie();
     if (!user || user.role !== 'freelancer') {
         console.error("Unauthorized attempt to get service for edit:", serviceId, "User:", user?.id);
         return null;
     }

     try {
         const service = await Service.findOne({
             where: {
                 id: serviceId,
                 freelancerId: user.id,
             },
         });
         return service;
     } catch (error) {
         console.error(`Failed to fetch service ${serviceId} for editing:`, error);
         return null;
     }
 }

export async function getServiceDetailsById(serviceId: string): Promise<Service | null> {
    try {
        const service = await Service.findOne({
            where: {
                id: serviceId,
                status: 'active',
            },
            include: [{
                model: User,
                as: 'freelancer',
                attributes: ['id', 'name']
            }],
        });
        return service;
    } catch (error) {
        console.error(`Failed to fetch service details for ${serviceId}:`, error);
        return null;
    }
}

export async function updateService(serviceId: string, formData: FormData) {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'freelancer') {
        return { error: "Unauthorized: Only freelancers can update services." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const imageFile = formData.get('image') as File | null;

    const validatedFields = EditServiceSchema.safeParse({ ...rawData, id: serviceId });

    if (!validatedFields.success) {
        console.error("Service update validation failed:", validatedFields.error.flatten().fieldErrors);
        return {
            error: "Invalid input data.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const service = await Service.findOne({
            where: {
                id: serviceId,
                freelancerId: user.id,
            },
        });

        if (!service) {
            return { error: "Service not found or you don't have permission to edit it." };
        }

        let imageUrl = service.imageUrl;
        if (imageFile && imageFile.size > 0) {
            imageUrl = await handleImageUpload(imageFile);
        }


        const { id, ...updateData } = validatedFields.data;


        await service.update({
            ...updateData,
            imageUrl: imageUrl,
        });

        console.log("Service updated:", service.id);
        return { success: true, service: service.toJSON() };

    } catch (error: any) {
        console.error(`Service update error for ${serviceId}:`, error);
         if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map((e: any) => ({ field: e.path, message: e.message }));
            return { error: "Validation failed.", details: errors };
        }
        return { error: "An unexpected error occurred during service update. Please try again." };
    }
}


export async function deleteService(serviceId: string) {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'freelancer') {
        return { error: "Unauthorized: Only freelancers can delete services." };
    }

    try {
        const service = await Service.findOne({
            where: {
                id: serviceId,
                freelancerId: user.id,
            },


        });

        if (!service) {
            return { error: "Service not found or you don't have permission to delete it." };
        }







        await service.destroy();

        console.log("Service deleted:", serviceId);
        return { success: true };

    } catch (error: any) {
        console.error(`Service deletion error for ${serviceId}:`, error);
        return { error: "An unexpected error occurred during service deletion. Please try again." };
    }
}
