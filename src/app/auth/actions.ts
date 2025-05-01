'use server';

import { User } from '@/models';
import { hashPassword, comparePassword, generateToken, type UserPayload } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sequelize } from '@/lib/db';

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['client', 'freelancer']),
});

const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});


export async function signupUser(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = SignupSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input data.",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    await sequelize.sync();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return { error: "User with this email already exists." };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role,
    });

    console.log("User created:", newUser.id);
    return { success: true, userId: newUser.id };

  } catch (error) {
    console.error("Signup error:", error);
    return { error: "An unexpected error occurred during signup. Please try again." };
  }
}


export async function loginUser(formData: FormData) {
     const rawData = Object.fromEntries(formData.entries());
     const validatedFields = LoginSchema.safeParse(rawData);

     if (!validatedFields.success) {
         return {
             error: "Invalid input data.",
             details: validatedFields.error.flatten().fieldErrors,
         };
     }

    const { email, password } = validatedFields.data;

    try {
        await sequelize.sync();
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return { error: "Invalid email or password." };
        }

        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return { error: "Invalid email or password." };
        }

        const userPayload: UserPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const token = await generateToken(userPayload);


        cookies().set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        console.log(`User ${user.email} logged in. Role: ${user.role}`);
        return { success: true, role: user.role };

    } catch (error) {
        console.error("Login error:", error);
        return { error: "An unexpected error occurred during login. Please try again." };
    }
}

export async function logoutUser() {
    try {
        cookies().delete('authToken');
        console.log("User logged out.");
        redirect('/');
    } catch (error) {
        console.error("Logout error:", error);
        return { error: "Failed to logout." };
    }
}
