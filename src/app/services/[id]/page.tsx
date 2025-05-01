'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, MessageSquare, Star, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { createStripeCheckoutSession } from '@/services/stripe';
import { createRazorpayOrder, verifyRazorpaySignature } from '@/services/razorpay';
import { getServiceDetailsById } from '@/services/service';
import type { Service, User } from '@/models';
import type { UserPayload } from '@/lib/auth';
import { Order as DbOrder } from '@/models';
import { createOrder } from '@/services/order';


interface DetailedService extends Service {
  freelancer: Pick<User, 'id' | 'name'>;
  features?: string[];
  rating?: number;
  reviews?: number;
  aiHint?: string;
  freelancerInitial?: string;
  currency?: string;
}


interface ServiceDetailPageProps {
  params: { id: string };
  user: UserPayload | null;
}


export default function ServiceDetailPage({ params, user }: ServiceDetailPageProps) {
  const [service, setService] = useState<DetailedService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadService = async () => {
        setIsLoading(true);
        try {

            const fetchedService = await getServiceDetailsById(params.id);
            if (fetchedService) {

                 const enrichedService: DetailedService = {
                    ...(fetchedService.toJSON() as Service),
                    freelancer: {
                        id: fetchedService.freelancer?.id || 'unknown',
                        name: fetchedService.freelancer?.name || 'Unknown Freelancer',
                    },

                    features: ["Feature 1", "Feature 2", "Responsive Design"],
                    rating: 4.8,
                    reviews: fetchedService.freelancer?.id === 'some-id' ? 25 : 10,
                    aiHint: `${fetchedService.category.toLowerCase()} design`,
                    freelancerInitial: fetchedService.freelancer?.name?.substring(0, 2).toUpperCase() || '??',
                    currency: 'usd'
                 };
                 setService(enrichedService);
            } else {
                 toast({
                    title: "Service Not Found",
                    description: "The service you are looking for might not exist.",
                    variant: "destructive",
                 });
            }

        } catch (error) {
            console.error("Failed to load service:", error);
            toast({
                title: "Error Loading Service",
                description: "Could not load service details. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    loadService();


  }, [params.id, toast]);

 const handleCheckout = async (provider: 'stripe' | 'razorpay') => {
    if (!service || !user) {
        toast({
            title: "Login Required",
            description: "Please log in or sign up to purchase a service.",
            variant: "destructive",
        });
        return;
    }
     if (user.role !== 'client') {
         toast({
             title: "Action Not Allowed",
             description: "Only clients can purchase services.",
             variant: "destructive",
         });
         return;
     }
    setIsProcessingPayment(true);

    try {

        const orderResult = await createOrder({
             clientId: user.id,
             freelancerId: service.freelancer.id,
             serviceId: service.id,
             totalAmount: service.price,
             requirements: "Initial requirements placeholder - gather this properly",
         });

         if (orderResult.error || !orderResult.order) {
              throw new Error(orderResult.error || "Failed to create order in database.");
         }
         const dbOrderId = orderResult.order.id;
         console.log("Database Order Created:", dbOrderId);


        const currency = service.currency || 'usd';

        if (provider === 'stripe') {
             if (currency === 'inr') {
                 throw new Error("Stripe checkout is not configured for INR in this example.");
             }
            const session = await createStripeCheckoutSession(dbOrderId, service.title, service.price, currency, user.email);
            if (session.url) {
                window.location.href = session.url;
            } else {
                throw new Error('Failed to get Stripe Checkout URL.');
            }
        } else if (provider === 'razorpay') {


            const razorpayCurrency = 'INR';
            let amountInPaisa = service.price;

            if (currency.toLowerCase() !== 'inr') {

                 console.warn(`Warning: Service price currency is ${currency}, attempting Razorpay checkout in INR. Using mock conversion.`);
                 amountInPaisa = service.price * 80;
            }


            console.log(`Creating Razorpay order: DB Order ${dbOrderId}, Amount ${amountInPaisa} ${razorpayCurrency}`);

            const razorpayOrder = await createRazorpayOrder(dbOrderId, amountInPaisa, razorpayCurrency);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "SkillHire",
                description: `Order for ${service.title}`,
                image: "/logo.png",
                order_id: razorpayOrder.id,
                handler: function (response: any){
                    console.log("Razorpay payment successful (client-side):", response);
                    toast({ title: "Payment Processing", description: "Verifying payment..." });

                    window.location.href = `/order/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&signature=${response.razorpay_signature}`;
                },
                prefill: {
                    name: user.name || '',
                    email: user.email,
                },
                notes: {
                    databaseOrderId: dbOrderId
                },
                theme: {
                    color: "#14b8a6"
                }
            };

            if (!options.key) {
                throw new Error("Razorpay Key ID is not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
            }


            const loadRazorpay = () => {
                return new Promise((resolve) => {
                  const script = document.createElement('script');
                  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                  script.onload = () => resolve(true);
                  script.onerror = () => resolve(false);
                  document.body.appendChild(script);
                });
            };

            const loaded = await loadRazorpay();

             if (!loaded) {
                 throw new Error("Failed to load Razorpay checkout script.");
             }



            // @ts-ignore
            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any){
                  console.error("Razorpay payment failed:", response.error);
                  toast({
                      title: "Payment Failed",
                      description: response.error.description || "An error occurred during payment.",
                      variant: "destructive"
                  });
                  setIsProcessingPayment(false);

                  window.location.href = `/order/cancel?order_id=${dbOrderId}&error=${encodeURIComponent(response.error.description || 'Payment failed')}`;
            });

            rzp.open();


            return;

        }

    } catch (error: any) {
        console.error(`Error during ${provider} checkout:`, error);
        toast({
            title: "Checkout Error",
            description: error.message || "Could not initiate payment. Please try again.",
            variant: "destructive",
        });
        setIsProcessingPayment(false);
    }

  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Header user={user} />
        <main className="flex-grow container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold mt-10 mb-4 text-destructive">Service Not Found</h1>
          <p className="text-muted-foreground mb-6">The service you are looking for might have been removed or does not exist.</p>
          <Link href="/services" passHref>
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }


  const displayPrice = (service.price / 100).toFixed(2);
  const currencySymbol = (service.currency === 'inr' ? '₹' : '$');
  const rating = service.rating ?? 0;
  const reviews = service.reviews ?? 0;
  const deliveryTime = service.deliveryTime ? `${service.deliveryTime} days` : 'N/A';
  const revisions = service.revisions ?? 0;


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header user={user} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/services" passHref>
            <Button variant="outline" size="sm" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">



          <div className="lg:col-span-2">
            <Badge variant="secondary" className="mb-2">{service.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary leading-tight">{service.title}</h1>

             <div className="flex items-center gap-3 mb-6 text-muted-foreground">
               <Avatar className="h-10 w-10">

                 <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${service.freelancer.name}`} alt={service.freelancer.name} />
                 <AvatarFallback>{service.freelancerInitial || '??'}</AvatarFallback>
               </Avatar>
               <div className="text-sm">
                  <span className="font-medium text-foreground">{service.freelancer.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-yellow-500">{rating.toFixed(1)}</span>
                    <span className="text-xs">({reviews} reviews)</span>
                  </div>
               </div>
             </div>


            <div className="relative h-[300px] md:h-[450px] w-full mb-8 rounded-xl overflow-hidden shadow-lg border border-border/20">
              <Image
                src={service.imageUrl || `https://picsum.photos/seed/${service.id}/800/600`}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={service.aiHint || 'service visual'}
                priority
              />
            </div>


            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">About this service</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{service.description}</p>
                </CardContent>
            </Card>


            {service.features && service.features.length > 0 && (
                <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">What's included:</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                        </li>
                        ))}
                    </ul>
                </CardContent>
                </Card>
            )}




            <Card className="bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
              <CardHeader>
                 <CardTitle className="text-xl font-semibold">Reviews ({reviews})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                 {reviews > 0 ? (
                    <div className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src="https://api.dicebear.com/8.x/lorelei/svg?seed=Alice" alt="Alice Brown" />
                        <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-foreground">Alice Brown</p>
                            <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-current' : ''}`} />)}
                            </div>
                        </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic">"Excellent work, delivered on time and exceeded expectations! Highly recommended."</p>
                    </div>
                 ) : (
                    <p className="text-muted-foreground">No reviews yet for this service.</p>
                 )}

                {reviews > 1 && (
                   <Button variant="link" size="sm" className="text-primary">Show all reviews</Button>
                )}
              </CardContent>
            </Card>
          </div>



          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl rounded-xl border border-border/60 bg-card/90 backdrop-blur-lg">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl font-semibold mb-1">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-foreground">Total Price</span>
                    <span className="text-3xl font-bold text-primary">{currencySymbol}{displayPrice}</span>
                </div>
                 <div className="space-y-2 text-sm text-muted-foreground mb-6">
                   <p><span className="font-medium text-foreground">Delivery Time:</span> {deliveryTime}</p>
                   <p><span className="font-medium text-foreground">Revisions Included:</span> {revisions}</p>
                 </div>

                 <div className="space-y-3">

                     {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (currency?.toLowerCase() !== 'inr') && (
                        <Button
                            size="lg"
                            className="w-full rounded-full shadow-md hover:shadow-lg transition-shadow bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => handleCheckout('stripe')}
                            disabled={isProcessingPayment || !user || user.role !== 'client'}
                            aria-disabled={isProcessingPayment || !user || user.role !== 'client'}
                        >
                            {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                            Pay with Card ({currencySymbol}{displayPrice})
                        </Button>
                     )}

                      {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (true) && (
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full rounded-full shadow-sm hover:shadow-md transition-shadow border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            onClick={() => handleCheckout('razorpay')}
                            disabled={isProcessingPayment || !user || user.role !== 'client'}
                            aria-disabled={isProcessingPayment || !user || user.role !== 'client'}
                        >
                            {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                             Pay with Razorpay
                        </Button>
                      )}
                      {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
                         <p className="text-sm text-center text-muted-foreground">Payment methods are currently unavailable.</p>
                      )}
                 </div>

                 <Button variant="outline" size="lg" className="w-full rounded-full shadow-sm hover:shadow-md transition-shadow mt-4">
                     <MessageSquare className="mr-2 h-5 w-5" /> Contact Seller
                 </Button>
              </CardContent>
               <CardFooter className="bg-secondary/30 p-4 rounded-b-xl text-center">
                 <p className="text-xs text-muted-foreground">Secure payment guaranteed.</p>
               </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
