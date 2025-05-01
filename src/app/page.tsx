import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  // Sample service data
  const sampleServices = [
    { id: 1, title: "Web Development", description: "Build responsive and modern websites.", price: "$500", image: "/placeholder-webdev.jpg", aiHint: "web development coding" },
    { id: 2, title: "Graphic Design", description: "Create stunning visuals for your brand.", price: "$300", image: "/placeholder-design.jpg", aiHint: "graphic design art"},
    { id: 3, title: "Content Writing", description: "Engaging and SEO-friendly content.", price: "$150", image: "/placeholder-writing.jpg", aiHint: "writing laptop"},
    { id: 4, title: "Digital Marketing", description: "Boost your online presence.", price: "$700", image: "/placeholder-marketing.jpg", aiHint: "digital marketing chart"},
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4 text-primary">Find the Perfect Freelance Services for Your Business</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with talented freelancers offering services to grow your brand.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/services" passHref>
              <Button size="lg">Browse Services</Button>
            </Link>
            <Link href="/auth/signup?role=freelancer" passHref>
              <Button size="lg" variant="outline">Become a Seller</Button>
            </Link>
          </div>
        </section>

        <section className="py-12">
          <h2 className="text-3xl font-semibold text-center mb-10">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleServices.map((service) => (
              <Card key={service.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={`https://picsum.photos/seed/${service.id}/400/300`}
                      alt={service.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      data-ai-hint={service.aiHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4">
                  <span className="font-semibold text-primary">{service.price}</span>
                  <Link href={`/services/${service.id}`} passHref>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" passHref>
              <Button variant="link" className="text-accent">View All Services &rarr;</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}