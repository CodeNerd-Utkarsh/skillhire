"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


// Mock function to get service details for editing - replace with actual data fetching
async function getServiceForEdit(id: string) {
  // In a real app, fetch this from your backend/database based on the ID, ensuring user ownership
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const mockServiceData = {
    "1": { title: "Modern Web App Development", description: "Full-stack web application using React, Node.js.", category: "Web Development", price: "1200", deliveryTime: "7", revisions: "3", image: "https://picsum.photos/seed/11/400/300", aiHint: "web development coding screen" },
    "5": { title: "E-commerce Site Setup", description: "Shopify or WooCommerce store creation.", category: "Web Development", price: "750", deliveryTime: "5", revisions: "2", image: "https://picsum.photos/seed/15/400/300", aiHint: "e-commerce online shopping" },
    // Add more mock services if needed corresponding to IDs
  };
  // @ts-ignore
  return mockServiceData[id] || null;
}


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

interface EditServicePageProps {
  params: { id: string };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const serviceId = params.id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [revisions, setRevisions] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For new uploads
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // For current image
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
      const fetchServiceData = async () => {
        setIsLoading(true);
        try {
          const serviceData = await getServiceForEdit(serviceId);
          if (serviceData) {
            setTitle(serviceData.title);
            setDescription(serviceData.description);
            setCategory(serviceData.category);
            setPrice(serviceData.price);
            setDeliveryTime(serviceData.deliveryTime);
            setRevisions(serviceData.revisions);
            setExistingImageUrl(serviceData.image); // Store existing image URL
          } else {
             toast({ title: "Error", description: "Service not found or you don't have permission to edit it.", variant: "destructive" });
             // Redirect logic here if needed
          }
        } catch (error) {
          console.error("Failed to fetch service data:", error);
          toast({ title: "Error", description: "Failed to load service details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };

      fetchServiceData();
    }, [serviceId, toast]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the new file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set preview for the new file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

     // --- Form Validation ---
     if (!title || !description || !category || !price || !deliveryTime) {
         toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
         setIsSaving(false);
         return;
     }

    // --- Update Service Logic ---
    // Use FormData if a new image is being uploaded
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('deliveryTime', deliveryTime);
    formData.append('revisions', revisions || '0');
    if (imageFile) { // Only append image if a new one was selected
      formData.append('image', imageFile);
    }

    console.log("Saving changes for service:", serviceId);
    // console.log("FormData entries (if image changed):");
    // formData.forEach((value, key) => { console.log(key, value); });

    try {
      // Example API call: Use PUT or PATCH
      // const response = await fetch(`/api/freelancer/services/${serviceId}`, {
      //   method: 'PUT', // or 'PATCH'
      //   body: imageFile ? formData : JSON.stringify({ title, description, category, price, deliveryTime, revisions }),
      //   headers: imageFile ? {} : { 'Content-Type': 'application/json' }, // Adjust headers based on content
      // });
      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to update service');
      // }

      // --- Mock Success ---
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      toast({
        title: "Service Updated Successfully",
        description: `Changes to "${title}" have been saved.`,
      });
       // Optionally redirect or update UI
       // If image was updated, update existingImageUrl if needed from response
       if (imagePreview) {
         setExistingImageUrl(imagePreview); // Optimistically update preview
         setImageFile(null); // Reset file input state
         setImagePreview(null);
       }
       // window.location.href = '/freelancer/dashboard';
      // --- End Mock Success ---

    } catch (error: any) {
      console.error("Service update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

 const handleDeleteService = async () => {
     setIsDeleting(true);
     console.log("Attempting to delete service:", serviceId);

     try {
        // Example API call: Use DELETE
        // const response = await fetch(`/api/freelancer/services/${serviceId}`, {
        //   method: 'DELETE',
        // });

        // if (!response.ok) {
        //    const data = await response.json().catch(() => ({})); // Try to parse error
        //    throw new Error(data.message || 'Failed to delete service');
        // }

        // --- Mock Success ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        toast({
          title: "Service Deleted",
          description: `"${title}" has been removed from your listings.`,
        });
        // Redirect to dashboard
        window.location.href = '/freelancer/dashboard';
        // --- End Mock Success ---

     } catch (error: any) {
        console.error("Service deletion error:", error);
        toast({
          title: "Deletion Failed",
          description: error.message || "Could not delete the service. Please try again.",
          variant: "destructive",
        });
     } finally {
        setIsDeleting(false);
        // Close the dialog - managed by AlertDialog itself
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
          <CardHeader className="flex flex-row justify-between items-start">
             <div>
                 <CardTitle className="text-2xl font-bold text-primary">Edit Service</CardTitle>
                 <CardDescription>Update the details of your service listing.</CardDescription>
             </div>
              <AlertDialog>
                 <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm" disabled={isLoading || isSaving || isDeleting}>
                     <Trash2 className="mr-2 h-4 w-4" /> Delete Service
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                       This action cannot be undone. This will permanently delete your service
                       listing and remove its data from our servers.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                        onClick={handleDeleteService}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     >
                        {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                         ) : null}
                         {isDeleting ? 'Deleting...' : 'Continue'}
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-3 gap-4">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                  </div>
                   <Skeleton className="h-20 w-full" />
                   <div className="flex justify-end">
                     <Skeleton className="h-10 w-24" />
                   </div>
               </div>
            ) : (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., I will design a professional logo for your brand"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  disabled={isSaving || isDeleting}
                />
                 <p className="text-xs text-muted-foreground">Max 80 characters.</p>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select onValueChange={setCategory} value={category} required disabled={isSaving || isDeleting}>
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
                  disabled={isSaving || isDeleting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price">Price ($)</Label>
                   <Input
                     id="price"
                     type="number"
                     placeholder="e.g., 50"
                     required
                     min="5" step="0.01"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     disabled={isSaving || isDeleting}
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
                     disabled={isSaving || isDeleting}
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
                       disabled={isSaving || isDeleting}
                     />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Service Image</Label>
                 <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 rounded border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                         {imagePreview ? ( // Show new preview if available
                           <img src={imagePreview} alt="New preview" className="object-cover h-full w-full" />
                         ) : existingImageUrl ? ( // Otherwise show existing image
                            <img src={existingImageUrl} alt="Current service image" className="object-cover h-full w-full" data-ai-hint="service visual design"/>
                         ) : ( // Fallback icon
                           <Upload className="h-8 w-8 text-muted-foreground" />
                         )}
                    </div>
                    <Input
                     id="image"
                     type="file"
                     accept="image/png, image/jpeg, image/webp"
                     // Not required on edit
                     onChange={handleImageChange}
                     className="hidden"
                     disabled={isSaving || isDeleting}
                    />
                   <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()} disabled={isSaving || isDeleting}>
                     {imageFile ? "Change Image" : "Upload New Image"}
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">Upload a new image to replace the current one (optional).</p>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSaving || isLoading || isDeleting}>
                   {isSaving ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                   ) : (
                     <Save className="mr-2 h-4 w-4" />
                   )}
                   {isSaving ? 'Saving Changes...' : 'Save Changes'}
                 </Button>
               </div>
            </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}