import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight, Search } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken, type UserPayload } from '@/lib/auth';

async function getUserFromCookie(): Promise<UserPayload | null> {
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) {
        return null;
    }
    return await verifyToken(token);
}


const sampleServices = [
    { id: "1", title: "Modern Web App Development", description: "Build responsive and modern websites.", price: 50000, image: `https://picsum.photos/seed/1/400/300`, aiHint: "web development coding", currency: "usd" },
    { id: "2", title: "Graphic Design", description: "Create stunning visuals for your brand.", price: 30000, image: `https://picsum.photos/seed/2/400/300`, aiHint: "graphic design art", currency: "usd"},
    { id: "3", title: "Content Writing", description: "Engaging content tailored to your audience.", price: 40000, image: `https://picsum.photos/seed/3/400/300`, aiHint: "content writing document", currency: "usd"},
    { id: "4", title: "Digital Marketing", description: "Boost your online presence and reach.", price: 70000, image: `https://picsum.photos/seed/4/400/300`, aiHint: "digital marketing chart", currency: "usd"},
    { id: "5", title: "Video Editing", description: "Professional video editing services.", price: 60000, image: `https://picsum.photos/seed/5/400/300`, aiHint: "video editing timeline", currency: "usd"},
    { id: "6", title: "Music Production", description: "High-quality music tracks and sound design.", price: 80000, image: `https://picsum.photos/seed/6/400/300`, aiHint: "music production mixer", currency: "usd"},
    { id: "7", title: "Mobile App UI/UX", description: "Intuitive interfaces for mobile apps.", price: 100000, image: `https://picsum.photos/seed/7/400/300`, aiHint: "mobile app design sketch", currency: "usd" },
    { id: "8", title: "Business Consulting", description: "Strategic advice to grow your business.", price: 150000, image: `https://picsum.photos/seed/8/400/300`, aiHint: "business meeting presentation", currency: "usd"},
  ];

export default async function Home() {
  const user = await getUserFromCookie();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/10 dark:from-slate-900 dark:to-slate-800/50">
      <Header user={user} />
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
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow px-8 py-3 text-lg w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                 <Search className="mr-2 h-5 w-5" /> Explore Services
              </Button>
            </Link>
            <Link href="/auth/signup?role=freelancer" passHref>
               <Button size="lg" variant="outline" className="bg-background hover:bg-primary/10 hover:text-primary rounded-full shadow-sm hover:shadow-md transition-shadow px-8 py-3 text-lg w-full sm:w-auto border-2 border-primary text-primary">
                Become a Seller
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-foreground">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {sampleServices.map((service) => {
                const displayPrice = (service.price / 100).toFixed(2);
                const currencySymbol = (service.currency === 'inr' ? '₹' : '$');
                return (
                  <Card key={service.id} className="group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl border-border/60 overflow-hidden bg-card/90 backdrop-blur-sm dark:bg-card/70">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          style={{ objectFit: 'cover' }}
                          className="rounded-t-xl group-hover:scale-105 transition-transform duration-300 ease-in-out"
                          data-ai-hint={service.aiHint}
                          priority={parseInt(service.id) <= 4}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 px-5">
                      <CardTitle className="text-xl font-semibold mb-2 text-primary group-hover:text-accent transition-colors">{service.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">{service.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-5 pt-4 border-t bg-secondary/30 dark:bg-secondary/20">
                      <span className="font-semibold text-accent">{currencySymbol}{displayPrice}+</span>
                      <Link href={`/services/${service.id}`} passHref>
                         <Button variant="ghost" size="sm" className="text-primary hover:text-accent hover:bg-primary/10 rounded-md">
                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                         </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
            })}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" passHref>
              <Button variant="link" className="text-lg text-primary hover:text-accent transition-colors">
                View All Services <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>



      </main>
      <Footer />
    </div>
  );
}
