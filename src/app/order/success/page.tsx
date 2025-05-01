"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getStripeCheckoutSession } from '@/services/stripe'; // Assuming this exists
import { useToast } from '@/hooks/use-toast';
// import { verifyRazorpayPayment } from '@/services/razorpay'; // You'll need a server action/API for this

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const stripeSessionId = searchParams.get('session_id');
    const razorpayPaymentId = searchParams.get('payment_id');
    const razorpayOrderId = searchParams.get('order_id');
    // const razorpaySignature = searchParams.get('razorpay_signature'); // Not typically sent via redirect

    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'pending' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const verifyPayment = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                if (stripeSessionId) {
                    // Verify Stripe Session
                    console.log("Verifying Stripe session:", stripeSessionId);
                    const session = await getStripeCheckoutSession(stripeSessionId);
                    if (session && session.payment_status === 'paid') {
                        console.log("Stripe session status: paid");
                        setStatus('success');
                        toast({
                            title: "Payment Successful",
                            description: "Your order is being processed.",
                        });
                    } else if (session) {
                         console.log("Stripe session status:", session.payment_status);
                         setStatus('pending'); // Or handle other statuses like 'unpaid'
                         setErrorMessage("Payment is still processing or requires action.");
                         toast({
                            title: "Payment Pending",
                            description: "Your payment is processing. We'll update you soon.",
                            variant: "default",
                         });
                    }
                     else {
                        throw new Error('Invalid Stripe session ID or session not found.');
                    }
                } else if (razorpayPaymentId && razorpayOrderId) {
                    // Verify Razorpay Payment (SERVER-SIDE verification is more secure via webhooks)
                    // This client-side check is basic and less reliable.
                    console.log("Razorpay payment detected (client-side):", razorpayPaymentId);
                     // Assume success based on redirect for now, webhook should confirm
                    setStatus('success');
                    toast({
                        title: "Payment Successful",
                        description: "Your order is being processed.",
                    });
                    // TODO: Ideally, call a server action/API route here to verify the Razorpay signature securely
                    // const isValid = await verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
                    // if (isValid) { setStatus('success'); } else { throw new Error('Invalid Razorpay payment.'); }

                } else {
                    throw new Error('No valid payment information found in URL.');
                }
            } catch (error: any) {
                console.error("Payment verification error:", error);
                setStatus('error');
                setErrorMessage(error.message || "Failed to verify payment status.");
                toast({
                    title: "Payment Verification Failed",
                    description: error.message || "There was an issue confirming your payment.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, [stripeSessionId, razorpayPaymentId, razorpayOrderId, toast]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-secondary/10">
                <Card className="w-full max-w-md shadow-xl">
                    <CardHeader className="text-center">
                        {isLoading && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />}
                        {!isLoading && status === 'success' && <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />}
                        {!isLoading && (status === 'error' || status === 'pending') && <Loader2 className="mx-auto h-12 w-12 text-yellow-500 mb-4" />}

                        <CardTitle className="text-2xl font-bold">
                            {isLoading ? "Verifying Payment..." :
                             status === 'success' ? "Payment Successful!" :
                             status === 'pending' ? "Payment Pending" :
                             "Payment Verification Failed"}
                        </CardTitle>
                        <CardDescription>
                            {isLoading ? "Please wait while we confirm your payment." :
                             status === 'success' ? "Thank you for your order. You will receive confirmation shortly." :
                             status === 'pending' ? "Your payment is currently being processed. This might take a few moments." :
                             errorMessage || "An error occurred while verifying your payment."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        {/* Display order summary or details here if needed */}
                        {!isLoading && status === 'success' && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Your order is now being processed. You can view its status in your dashboard.
                            </p>
                        )}
                         {!isLoading && status === 'pending' && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Please wait a few moments or check your email for confirmation. If the issue persists, contact support.
                            </p>
                        )}
                        {!isLoading && status === 'error' && (
                            <p className="text-sm text-destructive mb-4">
                                Please try the payment again or contact support if the problem continues.
                            </p>
                        )}
                        <div className="mt-6 flex justify-center gap-4">
                            <Link href="/client/dashboard" passHref>
                                <Button variant="default">Go to Dashboard</Button>
                            </Link>
                             <Link href="/services" passHref>
                                <Button variant="outline">Browse More Services</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
