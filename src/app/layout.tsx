import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cookies } from 'next/headers';
import { verifyToken, type UserPayload } from '@/lib/auth';




export const metadata: Metadata = {
  title: 'SkillHire',
  description: 'Find and offer freelance services',
};

async function getUserFromCookie(): Promise<UserPayload | null> {
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) {
        return null;
    }

    return await verifyToken(token);
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromCookie();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={`antialiased font-sans`}>


        {children}
        <Toaster />
      </body>
    </html>
  );
}
