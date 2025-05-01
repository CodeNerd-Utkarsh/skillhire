import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock function to get services - replace with actual data fetching
async function getServices() {
  // In a real app, fetch this from your backend/database
  return [
    { id: 1, title: "Modern Web App Development", description: "Full-stack web application using React, Node.js.", price: "$1200", image: "/placeholder-webapp.jpg", category: "Web Development", aiHint: "web development coding screen" },
    { id: 2, title: "Brand Identity Design", description: "Logo, color palette, and style guide.", price: "$800", image: "/placeholder-branding.jpg", category: "Graphic Design", aiHint: "logo design branding" },
    { id: 3, title: "Technical Article Writing", description: "Well-researched articles on tech topics.", price: "$250", image: "/placeholder-techwrite.jpg", category: "Content Writing", aiHint: "technical writing code" },
    { id: 4, title: "Social Media Marketing Strategy", description: "Comprehensive SMM plan.", price: "$950", image: "/placeholder-smm.jpg", category: "Digital Marketing", aiHint: "social media marketing analytics" },
    { id: 5, title: "E-commerce Site Setup", description: "Shopify or WooCommerce store creation.", price: "$750", image: "/placeholder-ecommerce.jpg", category: "Web Development", aiHint: "e-commerce online shopping" },
    { id: 6, title: "Promotional Video Editing", description: "Professional video editing for ads.", price: "$400", image: "/placeholder-videoedit.jpg", category: "Video & Animation", aiHint: "video editing software" },
  ];
}

export default async function ServicesMarketplace() {
  const services = await getServices();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Explore Services</h1>

        <div className="mb-8 max-w-xl mx-auto">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search for services (e.g., logo design, web development)"
               className="pl-10 w-full"
             />
           </div>
           {/* Add filters/category selection here later */}
         </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                 <div className="relative h-48 w-full">
                   <Image
                     src={`https://picsum.photos/seed/${service.id + 10}/400/300`} // Use different seeds
                     alt={service.title}
                     layout="fill"
                     objectFit="cover"
                     className="rounded-t-lg"
                     data-ai-hint={service.aiHint}
                   />
                 </div>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <CardTitle className="text-lg mb-1">{service.title}</CardTitle>
                <p className="text-xs text-muted-foreground mb-2">{service.category}</p>
                <CardDescription className="text-sm">{service.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t mt-auto">
                <span className="font-semibold text-primary">From {service.price}</span>
                <Link href={`/services/${service.id}`} passHref>
                  <Button variant="default" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}