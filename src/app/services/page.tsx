import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Service, User } from '@/models';
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


async function getServices() {
  try {
    const services = await Service.findAll({
      where: { status: 'active' },
      include: [{ model: User, as: 'freelancer', attributes: ['name'] }],
      order: [['createdAt', 'DESC']],
    });


    return services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description.substring(0, 100) + (service.description.length > 100 ? '...' : ''),
        price: service.price,

        image: service.imageUrl || `https://picsum.photos/seed/${service.id}/400/300`,
        category: service.category,
        aiHint: `${service.category.toLowerCase().replace(/ & /g, ' ')} visual design`,
        currency: 'usd',
        freelancerName: service.freelancer?.name || 'Unknown Freelancer',
    }));
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return [];
  }
}

export default async function ServicesMarketplace() {
  const services = await getServices();
  const user = await getUserFromCookie();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header user={user} />
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
          {services.length > 0 ? (
            services.map((service) => {
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
              })
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No services found.</p>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
