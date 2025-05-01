'use client'; // Needs to be client component for state and payment logic

import { useState } from 'react';
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
import { createStripeCheckoutSession } from '@/services/stripe'; // Assuming stripe service exists
import { createRazorpayOrder } from '@/services/razorpay'; // Assuming razorpay service exists

// Type definition for the service structure (assuming it's fetched)
interface Service {
  id: string;
  title: string;
  description: string;
  price: number; // Price in cents
  category: string;
  freelancer: string;
  rating: number;
  reviews: number;
  image: string; // Placeholder image URL
  deliveryTime: string;
  revisions: number;
  features: string[];
  aiHint: string;
  freelancerInitial: string;
  currency?: string; // Optional: Default to 'usd' or 'inr' based on logic
}

// Mock function - replace with actual data fetching
async function getServiceDetails(id: string): Promise<Service | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  const services: Record<string, Service> = {
    "1": { id: "1", title: "Modern Web App Development", description: "Get a high-performance, responsive web application built with the latest technologies like React, Next.js, and Node.js. Includes database integration and deployment.", price: 120000, category: "Web Development", freelancer: "Jane Doe", rating: 4.9, reviews: 25, image: `https://picsum.photos/seed/21/800/600`, deliveryTime: "7 days", revisions: 3, features: ["Responsive Design", "Database Integration", "Basic SEO Setup", "Deployment Support"], aiHint: "coding laptop desk", freelancerInitial: "JD", currency: "usd" },
    "2": { id: "2", title: "Brand Identity Design", description: "Complete branding package including a unique logo, color palette selection, typography guidelines, and a comprehensive style guide for consistency.", price: 80000, category: "Graphic Design", freelancer: "John Smith", rating: 4.8, reviews: 42, image: `https://picsum.photos/seed/22/800/600`, deliveryTime: "5 days", revisions: 5, features: ["Custom Logo Design", "Color Palette", "Typography Selection", "Brand Style Guide"], aiHint: "design process moodboard", freelancerInitial: "JS", currency: "usd" },
    "3": { id: "3", title: "Technical Article Writing", description: "Engaging and well-researched articles on complex technical topics, tailored for your audience. Includes keyword research and optimization.", price: 25000, category: "Content Writing", freelancer: "Alice Green", rating: 4.7, reviews: 18, image: `https://picsum.photos/seed/23/800/600`, deliveryTime: "3 days", revisions: 2, features: ["Keyword Research", "SEO Optimization", "Topic Research", "Proofreading"], aiHint: "writing keyboard hands", freelancerInitial: "AG", currency: "usd" },
    "4": { id: "4", title: "Social Media Marketing Strategy", description: "Develop a comprehensive social media plan tailored to your business goals. Includes content calendar, platform analysis, and growth tactics.", price: 95000, category: "Digital Marketing", freelancer: "Bob White", rating: 4.9, reviews: 31, image: `https://picsum.photos/seed/24/800/600`, deliveryTime: "10 days", revisions: 3, features: ["Platform Analysis", "Content Calendar", "Audience Targeting", "Performance Tracking Setup"], aiHint: "social media icons strategy", freelancerInitial: "BW", currency: "usd" },
    "5": { id: "5", title: "E-commerce Site Setup", description: "Launch your online store with Shopify or WooCommerce. Includes theme customization, product setup, and payment gateway integration.", price: 75000, category: "Web Development", freelancer: "Charlie Brown", rating: 4.8, reviews: 29, image: `https://picsum.photos/seed/25/800/600`, deliveryTime: "6 days", revisions: 2, features: ["Theme Customization", "Product Upload (up to 20)", "Payment Integration", "Basic Shipping Setup"], aiHint: "online store checkout", freelancerInitial: "CB", currency: "usd" },
    "6": { id: "6", title: "Promotional Video Editing", description: "Professionally edit your footage into a compelling promotional video. Includes color correction, music integration, and basic motion graphics.", price: 40000, category: "Video & Animation", freelancer: "Diana Prince", rating: 4.9, reviews: 35, image: `https://picsum.photos/seed/26/800/600`, deliveryTime: "4 days", revisions: 3, features: ["Color Correction", "Royalty-Free Music", "Basic Titles/Graphics", "HD Export"], aiHint: "video editing timeline software", freelancerInitial: "DP", currency: "usd" },
    "7": { id: "7", title: "Mobile App UI/UX Design", description: "Design intuitive and visually appealing user interfaces for your iOS or Android application using Figma. Includes wireframes and interactive prototypes.", price: 100000, category: "Graphic Design", freelancer: "Ethan Hunt", rating: 4.8, reviews: 22, image: `https://picsum.photos/seed/27/800/600`, deliveryTime: "8 days", revisions: 4, features: ["Wireframing", "High-Fidelity Mockups", "Interactive Prototype", "Style Guide"], aiHint: "mobile app prototype figma", freelancerInitial: "EH", currency: "usd" },
    "8": { id: "8", title: "SEO Audit & Optimization", description: "Comprehensive audit of your website's SEO performance. Includes technical analysis, on-page optimization recommendations, and a keyword strategy.", price: 60000, category: "Digital Marketing", freelancer: "Fiona Glenanne", rating: 4.7, reviews: 15, image: `https://picsum.photos/seed/28/800/600`, deliveryTime: "5 days", revisions: 1, features: ["Technical SEO Audit", "On-Page Recommendations", "Keyword Research", "Competitor Analysis"], aiHint: "seo report graph analysis", freelancerInitial: "FG", currency: "usd" },
    "9": { id: "9", title: "Custom Illustrations", description: "Create unique, high-quality vector illustrations for your website, application, or marketing materials based on your specific requirements.", price: 35000, category: "Graphic Design", freelancer: "George Smiley", rating: 4.9, reviews: 28, image: `https://picsum.photos/seed/29/800/600`, deliveryTime: "4 days", revisions: 3, features: ["Custom Concept", "Vector Format (SVG, AI)", "Multiple Color Options", "Commercial Use License"], aiHint: "digital art tablet drawing", freelancerInitial: "GS", currency: "usd" },
    "10": { id: "10", title: "Voice Over Recording", description: "Professional male/female voice over recording for commercials, narrations, audiobooks, or IVR systems. Delivered in high-quality audio format.", price: 15000, category: "Music & Audio", freelancer: "Holly Golightly", rating: 4.8, reviews: 50, image: `https://picsum.photos/seed/30/800/600`, deliveryTime: "2 days", revisions: 2, features: ["High-Quality WAV/MP3", "Noise Reduction", "Script Proofreading", "Choice of Tone"], aiHint: "studio microphone professional", freelancerInitial: "HG", currency: "usd" },
    "11": { id: "11", title: "Python Scripting for Automation", description: "Develop custom Python scripts to automate repetitive tasks, data processing, web scraping, or system administration.", price: 50000, category: "Programming & Tech", freelancer: "Indiana Jones", rating: 4.9, reviews: 19, image: `https://picsum.photos/seed/31/800/600`, deliveryTime: "5 days", revisions: 3, features: ["Custom Script Development", "Code Documentation", "Setup Instructions", "Error Handling"], aiHint: "python code editor screen", freelancerInitial: "IJ", currency: "usd" },
    "12": { id: "12", title: "Business Plan Writing", description: "Create a comprehensive and professional business plan suitable for investors, loan applications, or strategic planning. Includes market research and financial projections.", price: 110000, category: "Business", freelancer: "Kara Thrace", rating: 4.8, reviews: 12, image: `https://picsum.photos/seed/32/800/600`, deliveryTime: "10 days", revisions: 3, features: ["Market Analysis", "Financial Projections", "Executive Summary", "Marketing Strategy"], aiHint: "business presentation charts", freelancerInitial: "KT", currency: "usd" },
   };
  const service = services[id];
  if (!service) {
      return null;
  }
  return service;
}

interface ServiceDetailPageProps {
  params: { id: string };
}

// Need to make this a client component to handle state and actions
export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  // Fetch service details on mount
  useState(() => {
    const loadService = async () => {
        setIsLoading(true);
        try {
            const fetchedService = await getServiceDetails(params.id);
            setService(fetchedService);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]); // Dependency array includes params.id

  const handleCheckout = async (provider: 'stripe' | 'razorpay') => {
    if (!service) return;
    setIsProcessingPayment(true);

    try {
      // 1. Create an order in your database (this should ideally be a server action)
      // For now, we'll assume an order ID is created and proceed
      const dbOrderId = `mock_order_${Date.now()}`; // Replace with actual order creation logic
      const currency = service.currency || 'usd'; // Default currency

      if (provider === 'stripe') {
        // 2a. Create Stripe Checkout Session
        const session = await createStripeCheckoutSession(dbOrderId, service.title, service.price, currency);
        if (session.url) {
          // 3a. Redirect to Stripe Checkout
          window.location.href = session.url;
        } else {
           throw new Error('Failed to get Stripe Checkout URL.');
        }
      } else if (provider === 'razorpay') {
          // 2b. Create Razorpay Order
          const razorpayOrder = await createRazorpayOrder(dbOrderId, service.price, 'INR'); // Assuming INR for Razorpay example

          // 3b. Open Razorpay Checkout Modal
          const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public key from env
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              name: "SkillHire",
              description: `Order for ${service.title}`,
              image: "/logo.png", // Optional: Your logo URL
              order_id: razorpayOrder.id,
              // Callback URL is handled by webhook, but you can define handlers here too
              handler: function (response: any){
                  // Payment successful (client-side confirmation)
                  console.log("Razorpay payment successful:", response);
                  // Verify signature on server-side via API route or server action if needed
                  toast({ title: "Payment Processing", description: "Verifying payment..." });
                  // You might redirect to a success page here or wait for webhook
                  window.location.href = `/order/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
              },
              prefill: {
                  // Optional: Prefill user details
                  // name: "Client Name",
                  // email: "client@example.com",
                  // contact: "9999999999"
              },
              notes: {
                  databaseOrderId: dbOrderId
              },
              theme: {
                  color: "#3399cc" // Example theme color
              }
          };

         if (!options.key) {
             throw new Error("Razorpay Key ID is not configured.");
         }

          // Dynamically load Razorpay script if not already loaded
          const loadRazorpay = () => {
              return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
              });
          };

          await loadRazorpay();


          // @ts-ignore - Razorpay is loaded onto the window object
          const rzp = new window.Razorpay(options);

          rzp.on('payment.failed', function (response: any){
                console.error("Razorpay payment failed:", response.error);
                toast({
                    title: "Payment Failed",
                    description: response.error.description || "An error occurred during payment.",
                    variant: "destructive"
                });
                setIsProcessingPayment(false);
          });

          rzp.open();

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
     // Don't set isProcessingPayment to false here for redirects
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
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
        <Header />
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header />
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
                 <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${service.freelancer}`} alt={service.freelancer} />
                 <AvatarFallback>{service.freelancerInitial}</AvatarFallback>
               </Avatar>
               <div className="text-sm">
                  <span className="font-medium text-foreground">{service.freelancer}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-yellow-500">{service.rating}</span>
                    <span className="text-xs">({service.reviews} reviews)</span>
                  </div>
               </div>
             </div>

            <div className="relative h-[450px] w-full mb-8 rounded-xl overflow-hidden shadow-lg border border-border/20">
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={service.aiHint}
                priority
              />
            </div>

            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">About this service</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground leading-relaxed">{service.description}</p>
                </CardContent>
            </Card>


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


            <Card className="bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
              <CardHeader>
                 <CardTitle className="text-xl font-semibold">Reviews ({service.reviews})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                 <div className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                     <Avatar className="h-9 w-9">
                       <AvatarImage src="https://api.dicebear.com/8.x/lorelei/svg?seed=Alice" alt="Alice Brown" />
                       <AvatarFallback>AB</AvatarFallback>
                     </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">Alice Brown</p>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(service.rating) ? 'fill-current' : ''}`} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"Excellent work, delivered on time and exceeded expectations! Highly recommended."</p>
                 </div>

                  {service.reviews > 1 && (
                     <div className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                         <Avatar className="h-9 w-9">
                           <AvatarImage src="https://api.dicebear.com/8.x/adventurer/svg?seed=Bob" alt="Bob Johnson" />
                           <AvatarFallback>BJ</AvatarFallback>
                         </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">Bob Johnson</p>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < (Math.round(service.rating) -1) ? 'fill-current' : ''}`} />)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic">"Good communication and quality work. There were minor delays but overall satisfied."</p>
                     </div>
                  )}

                {service.reviews > 2 && (
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
                   <p><span className="font-medium text-foreground">Delivery Time:</span> {service.deliveryTime}</p>
                   <p><span className="font-medium text-foreground">Revisions Included:</span> {service.revisions}</p>
                 </div>
                 {/* Add buttons for different payment providers */}
                 <div className="space-y-3">
                     {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                        <Button
                            size="lg"
                            className="w-full rounded-full shadow-md hover:shadow-lg transition-shadow"
                            onClick={() => handleCheckout('stripe')}
                            disabled={isProcessingPayment}
                        >
                            {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                            Pay with Stripe ({currencySymbol}{displayPrice})
                        </Button>
                     )}
                     {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
                        <Button
                            size="lg"
                            variant="outline" // Different style for Razorpay
                            className="w-full rounded-full shadow-sm hover:shadow-md transition-shadow border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleCheckout('razorpay')}
                            disabled={isProcessingPayment}
                        >
                            {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                            Pay with Razorpay ({currencySymbol}{displayPrice})
                        </Button>
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
