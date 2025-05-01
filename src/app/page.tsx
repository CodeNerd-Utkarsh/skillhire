import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, Search } from 'lucide-react';

export default function Home() {
  // Sample service data - updated for diversity
  const sampleServices = [
    { id: 1, title: "Web Development", description: "Build responsive and modern websites.", price: "$500+", image: "/placeholder-webdev.jpg", aiHint: "web development coding" },
    { id: 2, title: "Graphic Design", description: "Create stunning visuals for your brand.", price: "$300+", image: "/placeholder-design.jpg", aiHint: "graphic design art"},
    { id: 7, title: "Mobile App UI/UX", description: "Intuitive interfaces for mobile apps.", price: "$1000+", image: "/placeholder-mobileui.jpg", aiHint: "mobile app design sketch" },
    { id: 4, title: "Digital Marketing", description: "Boost your online presence.", price: "$700+", image: "/placeholder-marketing.jpg", aiHint: "digital marketing chart"},
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/30 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-primary drop-shadow-md leading-tight">
            Find Top Freelance Talent <br /> Instantly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Connect with skilled professionals offering expert services to elevate your projects and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/services" passHref>
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow px-8 py-3 text-lg w-full sm:w-auto">
                 <Search className="mr-2 h-5 w-5" /> Explore Services
              </Button>
            </Link>
            <Link href="/auth/signup?role=freelancer" passHref>
              <Button size="lg" variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-shadow px-8 py-3 text-lg w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary/10">
                Become a Seller
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-foreground">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {sampleServices.map((service) => (
              <Card key={service.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl border-border/60 overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={`https://picsum.photos/seed/${service.id}/400/300`}
                      alt={service.title}
                      fill // Use fill instead of layout
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // Add sizes attribute
                      style={{ objectFit: 'cover' }} // Replace objectFit with style
                      className="rounded-t-xl"
                      data-ai-hint={service.aiHint}
                      priority={service.id <= 4} // Prioritize loading images
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5">
                  <CardTitle className="text-xl font-semibold mb-2 text-primary group-hover:text-accent transition-colors">{service.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-5 pt-4 border-t bg-secondary/30">
                  <span className="font-semibold text-accent">{service.price}</span>
                  <Link href={`/services/${service.id}`} passHref>
                    <Button variant="ghost" size="sm" className="text-primary">
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" passHref>
              <Button variant="link" className="text-lg text-primary hover:text-accent transition-colors">
                View All Services <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Optional: Add How it Works or Testimonials section here */}

      </main>
      <Footer />
    </div>
  );
}
