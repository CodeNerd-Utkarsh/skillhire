"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, PlusCircle, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import Image from 'next/image'; // Use Next.js Image

// TODO: Fetch categories from DB or config
const categories = [
  "Web Development",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video & Animation",
  "Music & Audio",
  "Programming & Tech",
  "Business",
  "Lifestyle",
];

export default function CreateServicePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(''); // Price in dollars for input
  const [deliveryTime, setDeliveryTime] = useState('');
  const [revisions, setRevisions] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
         toast({ title: "Invalid File Type", description: "Please upload a PNG, JPG, or WEBP image.", variant: "destructive" });
         setImageFile(null);
         setImagePreview(null);
         e.target.value = ''; // Reset file input
         return;
       }
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ title: "File Too Large", description: "Image size should not exceed 5MB.", variant: "destructive" });
          setImageFile(null);
          setImagePreview(null);
          e.target.value = ''; // Reset file input
          return;
       }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);


    const priceInCents = Math.round(parseFloat(price) * 100);
    if (!title || !description || !category || !price || !deliveryTime || !imageFile) {
        toast({
            title: "Missing Information",
            description: "Please fill out all required fields and upload an image.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
     if (isNaN(priceInCents) || priceInCents < 500) { // $5.00 minimum
         toast({ title: "Invalid Price", description: "Price must be a number and at least $5.00.", variant: "destructive" });
         setIsLoading(false);
         return;
     }
      if (isNaN(parseInt(deliveryTime)) || parseInt(deliveryTime) < 1) {
         toast({ title: "Invalid Delivery Time", description: "Delivery time must be a whole number of at least 1 day.", variant: "destructive" });
         setIsLoading(false);
         return;
     }


    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', priceInCents.toString()); // Send price in cents
    formData.append('deliveryTime', deliveryTime);
    formData.append('revisions', revisions || '0');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    console.log("Creating service with:", { title, description, category, priceInCents, deliveryTime, revisions, imageName: imageFile?.name });



    try {


      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Service Created Successfully",
        description: `"${title}" has been added to your listings.`,
      });

       window.location.href = '/freelancer/dashboard';


    } catch (error: any) {
      console.error("Service creation error:", error);
      toast({
        title: "Service Creation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
         <Link href="/freelancer/dashboard" passHref>
           <Button variant="outline" size="sm" className="mb-6 rounded-full">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
           </Button>
         </Link>

        <Card className="max-w-3xl mx-auto shadow-xl rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Create a New Service</CardTitle>
            <CardDescription>Describe the service you want to offer to clients.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., I will design a professional logo for your brand"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  disabled={isLoading}
                  className="rounded-md"
                />
                 <p className="text-xs text-muted-foreground">Max 80 characters. Keep it concise and clear.</p>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select onValueChange={setCategory} value={category} required disabled={isLoading}>
                   <SelectTrigger id="category" className="rounded-md">
                     <SelectValue placeholder="Select a category" />
                   </SelectTrigger>
                   <SelectContent>
                     {categories.map((cat) => (
                       <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail..."
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  className="rounded-md"
                />
                <p className="text-xs text-muted-foreground">Explain what you offer, your process, and what the client will receive.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price">Price ($)</Label>
                   <Input
                     id="price"
                     type="number"
                     placeholder="e.g., 50.00"
                     required
                     min="5.00"
                     step="0.01"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     disabled={isLoading}
                     className="rounded-md"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                   <Input
                     id="deliveryTime"
                     type="number"
                     placeholder="e.g., 3"
                     required
                     min="1"
                     value={deliveryTime}
                     onChange={(e) => setDeliveryTime(e.target.value)}
                     disabled={isLoading}
                     className="rounded-md"
                   />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="revisions">Revisions</Label>
                     <Input
                       id="revisions"
                       type="number"
                       placeholder="e.g., 2 (optional)"
                       min="0"
                       value={revisions}
                       onChange={(e) => setRevisions(e.target.value)}
                       disabled={isLoading}
                       className="rounded-md"
                     />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Service Image</Label>
                 <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 rounded-lg border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                         {imagePreview ? (
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                style={{ objectFit: 'cover' }}
                                data-ai-hint="upload preview"
                            />
                         ) : (
                           <Upload className="h-8 w-8 text-muted-foreground" />
                         )}
                    </div>
                    <Input
                     id="image"
                     type="file"
                     accept="image/png, image/jpeg, image/webp"
                     required
                     onChange={handleImageChange}
                     className="hidden"
                     disabled={isLoading}
                    />
                   <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()} disabled={isLoading} className="rounded-full">
                      <Upload className="mr-2 h-4 w-4" />
                     {imageFile ? "Change Image" : "Upload Image"}
                   </Button>
                 </div>
                <p className="text-xs text-muted-foreground">Upload a high-quality image (JPG, PNG, WEBP, max 5MB). Recommended size: 800x600px.</p>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full shadow-md hover:shadow-lg transition-shadow" disabled={isLoading}>
                   {isLoading ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                   ) : (
                     <PlusCircle className="mr-2 h-4 w-4" />
                   )}
                   {isLoading ? 'Creating Service...' : 'Create Service'}
                 </Button>
               </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
