import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


async function getServices() {

  // TODO: Fetch actual services from database
  return [
    { id: "1", title: "Modern Web App Development", description: "Full-stack web application using React, Node.js.", price: 120000, image: `https://picsum.photos/seed/11/400/300`, category: "Web Development", aiHint: "web development coding screen", currency: "usd" },
    { id: "2", title: "Brand Identity Design", description: "Logo, color palette, and style guide.", price: 80000, image: `https://picsum.photos/seed/12/400/300`, category: "Graphic Design", aiHint: "logo design branding", currency: "usd" },
    { id: "3", title: "Technical Article Writing", description: "Well-researched articles on tech topics.", price: 25000, image: `https://picsum.photos/seed/13/400/300`, category: "Content Writing", aiHint: "technical writing code", currency: "usd" },
    { id: "4", title: "Social Media Marketing Strategy", description: "Comprehensive SMM plan.", price: 95000, image: `https://picsum.photos/seed/14/400/300`, category: "Digital Marketing", aiHint: "social media marketing analytics", currency: "usd" },
    { id: "5", title: "E-commerce Site Setup", description: "Shopify or WooCommerce store creation.", price: 75000, image: `https://picsum.photos/seed/15/400/300`, category: "Web Development", aiHint: "e-commerce online shopping", currency: "usd" },
    { id: "6", title: "Promotional Video Editing", description: "Professional video editing for ads.", price: 40000, image: `https://picsum.photos/seed/16/400/300`, category: "Video & Animation", aiHint: "video editing software", currency: "usd" },
    { id: "7", title: "Mobile App UI/UX Design", description: "User-friendly mobile interface designs.", price: 100000, image: `https://picsum.photos/seed/17/400/300`, category: "Graphic Design", aiHint: "mobile app design sketch", currency: "usd" },
    { id: "8", title: "SEO Audit & Optimization", description: "Improve your website's search ranking.", price: 60000, image: `https://picsum.photos/seed/18/400/300`, category: "Digital Marketing", aiHint: "seo analysis report", currency: "usd" },
    { id: "9", title: "Custom Illustrations", description: "Unique illustrations for web or print.", price: 35000, image: `https://picsum.photos/seed/19/400/300`, category: "Graphic Design", aiHint: "digital illustration art", currency: "usd" },
    { id: "10", title: "Voice Over Recording", description: "Professional voice overs for videos.", price: 15000, image: `https://picsum.photos/seed/20/400/300`, category: "Music & Audio", aiHint: "microphone recording studio", currency: "usd" },
    { id: "11", title: "Python Scripting for Automation", description: "Automate tasks with Python scripts.", price: 50000, image: `https://picsum.photos/seed/21/400/300`, category: "Programming & Tech", aiHint: "python code computer", currency: "usd" },
    { id: "12", title: "Business Plan Writing", description: "Detailed business plans for startups.", price: 110000, image: `https://picsum.photos/seed/22/400/300`, category: "Business", aiHint: "business plan document", currency: "usd" },
  ];
}

export default async function ServicesMarketplace() {
  const services = await getServices();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-primary drop-shadow-sm">Explore Services</h1>

        <div className="mb-10 max-w-xl mx-auto">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search for services (e.g., logo design, web development)"
               className="pl-10 w-full rounded-full shadow-sm focus:shadow-md transition-shadow"
             />
           </div>

         </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => {
             const displayPrice = (service.price / 100).toFixed(2);
             const currencySymbol = (service.currency === 'inr' ? '₹' : '$');
            return (
                <Card key={service.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl border-border/60 bg-card/80 backdrop-blur-sm">
                <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                    <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className="rounded-t-xl"
                        data-ai-hint={service.aiHint}
                        priority={parseInt(service.id) <= 4}
                    />
                    </div>
                </CardHeader>
                <CardContent className="pt-4 flex-grow">
                    <CardTitle className="text-lg mb-1 font-semibold text-primary group-hover:text-accent transition-colors">{service.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">{service.category}</p>
                    <CardDescription className="text-sm leading-relaxed">{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 border-t mt-auto bg-secondary/30 dark:bg-secondary/20 rounded-b-xl">
                    <span className="font-semibold text-accent">From {currencySymbol}{displayPrice}</span>
                    <Link href={`/services/${service.id}`} passHref>
                    <Button variant="default" size="sm" className="rounded-full shadow-sm hover:shadow-md transition-shadow">
                        View
                    </Button>
                    </Link>
                </CardFooter>
                </Card>
             );
            })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
