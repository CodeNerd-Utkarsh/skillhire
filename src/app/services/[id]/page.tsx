import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, CreditCard, MessageSquare, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock function to get a single service by ID - replace with actual data fetching
async function getServiceDetails(id: string) {
  // In a real app, fetch this from your backend/database based on the ID
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const services = {
    "1": { id: "1", title: "Modern Web App Development", description: "Get a high-performance, responsive web application built with the latest technologies like React, Next.js, and Node.js. Includes database integration and deployment.", price: "1200", category: "Web Development", freelancer: "Jane Doe", rating: 4.9, reviews: 25, image: "/placeholder-webapp-detail.jpg", deliveryTime: "7 days", revisions: 3, features: ["Responsive Design", "Database Integration", "Basic SEO Setup", "Deployment Support"], aiHint: "coding laptop desk", freelancerInitial: "JD" },
    "2": { id: "2", title: "Brand Identity Design", description: "Complete branding package including a unique logo, color palette selection, typography guidelines, and a comprehensive style guide for consistency.", price: "800", category: "Graphic Design", freelancer: "John Smith", rating: 4.8, reviews: 42, image: "/placeholder-branding-detail.jpg", deliveryTime: "5 days", revisions: 5, features: ["Custom Logo Design", "Color Palette", "Typography Selection", "Brand Style Guide"], aiHint: "design process moodboard", freelancerInitial: "JS" },
    "3": { id: "3", title: "Technical Article Writing", description: "Engaging and well-researched articles on complex technical topics, tailored for your audience. Includes keyword research and optimization.", price: "250", category: "Content Writing", freelancer: "Alice Green", rating: 4.7, reviews: 18, image: "/placeholder-techwrite-detail.jpg", deliveryTime: "3 days", revisions: 2, features: ["Keyword Research", "SEO Optimization", "Topic Research", "Proofreading"], aiHint: "writing keyboard hands", freelancerInitial: "AG" },
    "4": { id: "4", title: "Social Media Marketing Strategy", description: "Develop a comprehensive social media plan tailored to your business goals. Includes content calendar, platform analysis, and growth tactics.", price: "950", category: "Digital Marketing", freelancer: "Bob White", rating: 4.9, reviews: 31, image: "/placeholder-smm-detail.jpg", deliveryTime: "10 days", revisions: 3, features: ["Platform Analysis", "Content Calendar", "Audience Targeting", "Performance Tracking Setup"], aiHint: "social media icons strategy", freelancerInitial: "BW" },
    "5": { id: "5", title: "E-commerce Site Setup", description: "Launch your online store with Shopify or WooCommerce. Includes theme customization, product setup, and payment gateway integration.", price: "750", category: "Web Development", freelancer: "Charlie Brown", rating: 4.8, reviews: 29, image: "/placeholder-ecommerce-detail.jpg", deliveryTime: "6 days", revisions: 2, features: ["Theme Customization", "Product Upload (up to 20)", "Payment Integration", "Basic Shipping Setup"], aiHint: "online store checkout", freelancerInitial: "CB" },
    "6": { id: "6", title: "Promotional Video Editing", description: "Professionally edit your footage into a compelling promotional video. Includes color correction, music integration, and basic motion graphics.", price: "400", category: "Video & Animation", freelancer: "Diana Prince", rating: 4.9, reviews: 35, image: "/placeholder-videoedit-detail.jpg", deliveryTime: "4 days", revisions: 3, features: ["Color Correction", "Royalty-Free Music", "Basic Titles/Graphics", "HD Export"], aiHint: "video editing timeline software", freelancerInitial: "DP" },
    "7": { id: "7", title: "Mobile App UI/UX Design", description: "Design intuitive and visually appealing user interfaces for your iOS or Android application using Figma. Includes wireframes and interactive prototypes.", price: "1000", category: "Graphic Design", freelancer: "Ethan Hunt", rating: 4.8, reviews: 22, image: "/placeholder-mobileui-detail.jpg", deliveryTime: "8 days", revisions: 4, features: ["Wireframing", "High-Fidelity Mockups", "Interactive Prototype", "Style Guide"], aiHint: "mobile app prototype figma", freelancerInitial: "EH" },
    "8": { id: "8", title: "SEO Audit & Optimization", description: "Comprehensive audit of your website's SEO performance. Includes technical analysis, on-page optimization recommendations, and a keyword strategy.", price: "600", category: "Digital Marketing", freelancer: "Fiona Glenanne", rating: 4.7, reviews: 15, image: "/placeholder-seo-detail.jpg", deliveryTime: "5 days", revisions: 1, features: ["Technical SEO Audit", "On-Page Recommendations", "Keyword Research", "Competitor Analysis"], aiHint: "seo report graph analysis", freelancerInitial: "FG" },
    // Add entries for 9-12 if needed, following the same structure
    "9": { id: "9", title: "Custom Illustrations", description: "Create unique, high-quality vector illustrations for your website, application, or marketing materials based on your specific requirements.", price: "350", category: "Graphic Design", freelancer: "George Smiley", rating: 4.9, reviews: 28, image: "/placeholder-illustration-detail.jpg", deliveryTime: "4 days", revisions: 3, features: ["Custom Concept", "Vector Format (SVG, AI)", "Multiple Color Options", "Commercial Use License"], aiHint: "digital art tablet drawing", freelancerInitial: "GS" },
    "10": { id: "10", title: "Voice Over Recording", description: "Professional male/female voice over recording for commercials, narrations, audiobooks, or IVR systems. Delivered in high-quality audio format.", price: "150", category: "Music & Audio", freelancer: "Holly Golightly", rating: 4.8, reviews: 50, image: "/placeholder-voiceover-detail.jpg", deliveryTime: "2 days", revisions: 2, features: ["High-Quality WAV/MP3", "Noise Reduction", "Script Proofreading", "Choice of Tone"], aiHint: "studio microphone professional", freelancerInitial: "HG" },
    "11": { id: "11", title: "Python Scripting for Automation", description: "Develop custom Python scripts to automate repetitive tasks, data processing, web scraping, or system administration.", price: "500", category: "Programming & Tech", freelancer: "Indiana Jones", rating: 4.9, reviews: 19, image: "/placeholder-python-detail.jpg", deliveryTime: "5 days", revisions: 3, features: ["Custom Script Development", "Code Documentation", "Setup Instructions", "Error Handling"], aiHint: "python code editor screen", freelancerInitial: "IJ" },
    "12": { id: "12", title: "Business Plan Writing", description: "Create a comprehensive and professional business plan suitable for investors, loan applications, or strategic planning. Includes market research and financial projections.", price: "1100", category: "Business", freelancer: "Kara Thrace", rating: 4.8, reviews: 12, image: "/placeholder-businessplan-detail.jpg", deliveryTime: "10 days", revisions: 3, features: ["Market Analysis", "Financial Projections", "Executive Summary", "Marketing Strategy"], aiHint: "business presentation charts", freelancerInitial: "KT" },
  };
  // @ts-ignore
  const service = services[id];
  if (!service) {
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
          {/* Left Column - Image and Service Details */}
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
                src={`https://picsum.photos/seed/${service.id + 20}/800/600`}
                alt={service.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={service.aiHint}
                priority // Prioritize loading the main service image
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

            {/* Reviews Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/60 rounded-xl shadow-md">
              <CardHeader>
                 <CardTitle className="text-xl font-semibold">Reviews ({service.reviews})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 {/* Example Review 1 */}
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
                  {/* Example Review 2 (if available) */}
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
                {/* Add more reviews or pagination */}
                {service.reviews > 2 && (
                   <Button variant="link" size="sm" className="text-primary">Show all reviews</Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl rounded-xl border border-border/60 bg-card/90 backdrop-blur-lg">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-xl font-semibold mb-1">Order Details</CardTitle>
                {/* <CardDescription>Basic Package</CardDescription> Add package options later */}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-foreground">Total Price</span>
                    <span className="text-3xl font-bold text-primary">${service.price}</span>
                </div>
                 <div className="space-y-2 text-sm text-muted-foreground mb-6">
                   <p><span className="font-medium text-foreground">Delivery Time:</span> {service.deliveryTime}</p>
                   <p><span className="font-medium text-foreground">Revisions Included:</span> {service.revisions}</p>
                 </div>
                 <Button size="lg" className="w-full rounded-full shadow-md hover:shadow-lg transition-shadow mb-3">
                    <ShoppingCart className="mr-2 h-5 w-5" /> Continue to Checkout (${service.price})
                 </Button>
                 <Button variant="outline" size="lg" className="w-full rounded-full shadow-sm hover:shadow-md transition-shadow">
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
