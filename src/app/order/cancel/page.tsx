"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function OrderCancelPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id'); // Get order ID if passed

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/10">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                        <CardTitle className="text-2xl font-bold">Order Cancelled</CardTitle>
                        <CardDescription>
                            Your payment process was cancelled. Your order ({orderId ? `ID: ${orderId}` : 'details not available'}) was not completed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            You have not been charged. You can go back to the service page to try again or browse other services.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            {/* TODO: Link back to the specific service page if possible */}
                            <Link href="/services" passHref>
                                <Button variant="default">Browse Services</Button>
                            </Link>
                            <Link href="/client/dashboard" passHref>
                                <Button variant="outline">Go to Dashboard</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
