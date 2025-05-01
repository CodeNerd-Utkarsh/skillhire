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

// Mock categories - replace with actual categories from DB or config
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
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [revisions, setRevisions] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    // --- Form Validation (Basic Example) ---
    if (!title || !description || !category || !price || !deliveryTime || !imageFile) {
        toast({
            title: "Missing Information",
            description: "Please fill out all required fields and upload an image.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    // --- Create Service Logic ---
    // Replace with your API call to create the service
    // You'll likely need to use FormData if uploading the image file directly

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('deliveryTime', deliveryTime);
    formData.append('revisions', revisions || '0'); // Handle optional revisions
    if (imageFile) {
      formData.append('image', imageFile);
    }

    console.log("Creating service with:", { title, description, category, price, deliveryTime, revisions, imageName: imageFile?.name });
    // console.log("FormData entries:");
    // formData.forEach((value, key) => { console.log(key, value); });


    try {
      // Example using fetch with FormData:
      // const response = await fetch('/api/freelancer/services', {
      //   method: 'POST',
      //   body: formData, // Send FormData directly
      //   // Note: Do NOT set 'Content-Type' header manually when using FormData,
      //   // the browser will set it correctly with the boundary.
      // });
      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to create service');
      // }

      // --- Mock Success ---
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay and upload
      toast({
        title: "Service Created Successfully",
        description: `"${title}" has been added to your listings.`,
      });
      // Redirect to freelancer dashboard
       window.location.href = '/freelancer/dashboard'; // Or use Next.js router
      // --- End Mock Success ---


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
           <Button variant="outline" size="sm" className="mb-6">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
           </Button>
         </Link>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Create a New Service</CardTitle>
            <CardDescription>Describe the service you want to offer to clients.</CardDescription>
          </CardHeader>
          <CardContent>
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
                />
                 <p className="text-xs text-muted-foreground">Max 80 characters. Keep it concise and clear.</p>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select onValueChange={setCategory} value={category} required disabled={isLoading}>
                   <SelectTrigger id="category">
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
                />
                <p className="text-xs text-muted-foreground">Explain what you offer, your process, and what the client will receive.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price">Price ($)</Label>
                   <Input
                     id="price"
                     type="number"
                     placeholder="e.g., 50"
                     required
                     min="5" // Example minimum price
                     step="0.01"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     disabled={isLoading}
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
                     />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Service Image</Label>
                 <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 rounded border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                         {imagePreview ? (
                           <img src={imagePreview} alt="Preview" className="object-cover h-full w-full" />
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
                   <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()} disabled={isLoading}>
                     {imageFile ? "Change Image" : "Upload Image"}
                   </Button>
                 </div>
                <p className="text-xs text-muted-foreground">Upload a high-quality image (JPG, PNG, WEBP). Recommended size: 800x600px.</p>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
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