import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, CreditCard, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';

// Mock function to get a single service by ID - replace with actual data fetching
async function getServiceDetails(id: string) {
  // In a real app, fetch this from your backend/database based on the ID
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const services = [
    { id: "1", title: "Modern Web App Development", description: "Get a high-performance, responsive web application built with the latest technologies like React, Next.js, and Node.js. Includes database integration and deployment.", price: "$1200", category: "Web Development", freelancer: "Jane Doe", rating: 4.9, reviews: 25, image: "/placeholder-webapp-detail.jpg", deliveryTime: "7 days", revisions: 3, features: ["Responsive Design", "Database Integration", "Basic SEO Setup", "Deployment Support"], aiHint: "coding laptop desk" },
    { id: "2", title: "Brand Identity Design", description: "Complete branding package including a unique logo, color palette selection, typography guidelines, and a comprehensive style guide for consistency.", price: "$800", category: "Graphic Design", freelancer: "John Smith", rating: 4.8, reviews: 42, image: "/placeholder-branding-detail.jpg", deliveryTime: "5 days", revisions: 5, features: ["Custom Logo Design", "Color Palette", "Typography Selection", "Brand Style Guide"], aiHint: "design process moodboard" },
    // Add more mock services if needed
  ];
  const service = services.find(s => s.id === id);
  if (!service) {
      // Handle not found case appropriately in a real app
      return null;
  }
  return service;
}

interface ServiceDetailPageProps {
  params: { id: string };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const service = await getServiceDetails(params.id);

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold mt-10">Service not found</h1>
          <Link href="/services" passHref>
            <Button variant="link" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/services" passHref>
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Button>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Freelancer Info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4 text-primary">{service.title}</h1>
             <div className="flex items-center gap-2 mb-4 text-muted-foreground">
               {/* Placeholder for freelancer avatar */}
               <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">JD</div>
               <span>{service.freelancer}</span>
               <span className="text-yellow-500 flex items-center gap-1">
                 <Star className="h-4 w-4 fill-current" /> {service.rating} ({service.reviews} reviews)
               </span>
             </div>
            <div className="relative h-96 w-full mb-6 rounded-lg overflow-hidden shadow-md">
              <Image
                src={`https://picsum.photos/seed/${service.id + 20}/800/600`}
                alt={service.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={service.aiHint}
              />
            </div>
            <h2 className="text-2xl font-semibold mb-3">About this service</h2>
            <p className="text-foreground leading-relaxed mb-6">{service.description}</p>

            <h3 className="text-xl font-semibold mb-3">What's included:</h3>
            <ul className="space-y-2 mb-8">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {/* Reviews Section Placeholder */}
            <h3 className="text-xl font-semibold mb-3">Reviews ({service.reviews})</h3>
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">AB</div>
                  <div>
                    <p className="font-semibold">Alice Brown</p>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.round(service.rating) ? 'fill-current' : ''}`} />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Excellent work, delivered on time and exceeded expectations!</p>
              </CardContent>
            </Card>
            {/* Add more reviews or pagination */}
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex justify-between items-center">
                  <span>{service.category}</span>
                  <span className="text-3xl font-bold text-primary">{service.price}</span>
                </CardTitle>
                <CardDescription>Basic Package</CardDescription> {/* Or dynamic package name */}
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{service.description.substring(0, 100)}...</p> {/* Short description */}
                 <div className="space-y-2 text-sm text-muted-foreground mb-6">
                   <p>Delivery Time: {service.deliveryTime}</p>
                   <p>Revisions: {service.revisions}</p>
                 </div>
                 <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3">
                    <CreditCard className="mr-2 h-4 w-4" /> Continue ({service.price})
                 </Button>
                 <Button variant="outline" size="lg" className="w-full">
                     <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}