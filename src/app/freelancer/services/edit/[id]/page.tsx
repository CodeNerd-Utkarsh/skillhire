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
import { ArrowLeft, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react'; // Renamed Image import
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image'; // Use Next.js Image for optimization
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
    "1": { title: "Modern Web App Development", description: "Full-stack web application using React, Node.js.", category: "Web Development", price: "1200", deliveryTime: "7", revisions: "3", image: `https://picsum.photos/seed/11/400/300`, aiHint: "web development coding screen" },
    "2": { title: "Brand Identity Design", description: "Logo, color palette, and style guide.", category: "Graphic Design", price: "800", deliveryTime: "5", revisions: "5", image: `https://picsum.photos/seed/12/400/300`, aiHint: "logo design branding" },
    "3": { title: "Technical Article Writing", description: "Well-researched articles on tech topics.", category: "Content Writing", price: "250", deliveryTime: "3", revisions: "2", image: `https://picsum.photos/seed/13/400/300`, aiHint: "technical writing code" },
    "4": { title: "Social Media Marketing Strategy", description: "Comprehensive SMM plan.", category: "Digital Marketing", price: "950", deliveryTime: "10", revisions: "3", image: `https://picsum.photos/seed/14/400/300`, aiHint: "social media marketing analytics" },
    "5": { title: "E-commerce Site Setup", description: "Shopify or WooCommerce store creation.", category: "Web Development", price: "750", deliveryTime: "6", revisions: "2", image: `https://picsum.photos/seed/15/400/300`, aiHint: "e-commerce online shopping" },
    "6": { title: "Promotional Video Editing", description: "Professional video editing for ads.", category: "Video & Animation", price: "400", deliveryTime: "4", revisions: "3", image: `https://picsum.photos/seed/16/400/300`, aiHint: "video editing software" },
    "7": { title: "Mobile App UI/UX Design", description: "User-friendly mobile interface designs.", category: "Graphic Design", price: "1000", deliveryTime: "8", revisions: "4", image: `https://picsum.photos/seed/17/400/300`, aiHint: "mobile app design sketch" },
    "8": { title: "SEO Audit & Optimization", description: "Improve your website's search ranking.", category: "Digital Marketing", price: "600", deliveryTime: "5", revisions: "1", image: `https://picsum.photos/seed/18/400/300`, aiHint: "seo analysis report" },
    "9": { title: "Custom Illustrations", description: "Unique illustrations for web or print.", category: "Graphic Design", price: "350", deliveryTime: "4", revisions: "3", image: `https://picsum.photos/seed/19/400/300`, aiHint: "digital illustration art" },
    "10": { title: "Voice Over Recording", description: "Professional voice overs for videos.", category: "Music & Audio", price: "150", deliveryTime: "2", revisions: "2", image: `https://picsum.photos/seed/20/400/300`, aiHint: "microphone recording studio" },
    "11": { title: "Python Scripting for Automation", description: "Automate tasks with Python scripts.", category: "Programming & Tech", price: "500", deliveryTime: "5", revisions: "3", image: `https://picsum.photos/seed/21/400/300`, aiHint: "python code computer" },
    "12": { title: "Business Plan Writing", description: "Detailed business plans for startups.", category: "Business", price: "1100", deliveryTime: "10", revisions: "3", image: `https://picsum.photos/seed/22/400/300`, aiHint: "business plan document" },
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
            setRevisions(serviceData.revisions || ''); // Ensure revisions is not undefined
            setExistingImageUrl(serviceData.image); // Store existing image URL
          } else {
             toast({ title: "Error", description: "Service not found or you don't have permission to edit it.", variant: "destructive" });
             // Consider redirecting using next/navigation's useRouter
             // router.push('/freelancer/dashboard');
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
      // Simple validation (optional)
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
         toast({ title: "Invalid File Type", description: "Please upload a PNG, JPG, or WEBP image.", variant: "destructive" });
         return;
      }
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast({ title: "File Too Large", description: "Image size should not exceed 5MB.", variant: "destructive" });
          return;
       }

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
     if (isNaN(parseFloat(price)) || parseFloat(price) < 5) {
         toast({ title: "Invalid Price", description: "Price must be a number and at least $5.", variant: "destructive" });
         setIsSaving(false);
         return;
     }
      if (isNaN(parseInt(deliveryTime)) || parseInt(deliveryTime) < 1) {
         toast({ title: "Invalid Delivery Time", description: "Delivery time must be a whole number of at least 1 day.", variant: "destructive" });
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
    // Log FormData in a readable way (for debugging)
    // const dataToSend: Record<string, any> = {};
    // formData.forEach((value, key) => { dataToSend[key] = value instanceof File ? `File: ${value.name}` : value });
    // console.log("Data to send (mock):", dataToSend);


    try {
      // Example API call: Use PUT or PATCH
      // const response = await fetch(`/api/freelancer/services/${serviceId}`, {
      //   method: 'PUT', // or 'PATCH'
      //   body: formData, // Send FormData directly
      // });
      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.message || 'Failed to update service');
      // }

      // --- Mock Success ---
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      toast({
        title: "Service Updated Successfully",
        description: `Changes to "${title}" have been saved.`,
        variant: "default", // Use default for success
      });
       // Optionally redirect or update UI
       // If image was updated, maybe get the new URL from the API response
       if (imagePreview) {
         setExistingImageUrl(imagePreview); // Optimistically update display URL
         setImageFile(null); // Reset file input state
         setImagePreview(null);
       }
       // Consider using router.push('/freelancer/dashboard') for navigation
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
        // Redirect to dashboard - use next/navigation router is better practice
        // router.push('/freelancer/dashboard');
         window.location.href = '/freelancer/dashboard'; // Simple redirect for now
        // --- End Mock Success ---

     } catch (error: any) {
        console.error("Service deletion error:", error);
        toast({
          title: "Deletion Failed",
          description: error.message || "Could not delete the service. Please try again.",
          variant: "destructive",
        });
     } finally {
        // isDeleting state is handled by the AlertDialog's onOpenChange or manually if needed
     }
 };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
         <Link href="/freelancer/dashboard" passHref>
           <Button variant="outline" size="sm" className="mb-6 rounded-full">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
           </Button>
         </Link>

        <Card className="max-w-3xl mx-auto shadow-xl rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row justify-between items-start border-b pb-4">
             <div>
                 <CardTitle className="text-2xl font-bold text-primary">Edit Service</CardTitle>
                 <CardDescription>Update the details of your service listing.</CardDescription>
             </div>
              <AlertDialog onOpenChange={(open) => !open && setIsDeleting(false)}> {/* Reset deleting state on close */}
                 <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm" disabled={isLoading || isSaving || isDeleting} className="rounded-full">
                     <Trash2 className="mr-2 h-4 w-4" /> Delete Service
                   </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                       This action cannot be undone. This will permanently delete your service
                       listing and remove its data from our servers. Active orders related to this service might be affected.
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
                         {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
               <div className="space-y-6 p-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-1/2 rounded-md" />
                  <Skeleton className="h-24 w-full rounded-md" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Skeleton className="h-10 w-full rounded-md" />
                     <Skeleton className="h-10 w-full rounded-md" />
                     <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                   <div className="flex items-center gap-4">
                       <Skeleton className="h-20 w-32 rounded-md" />
                       <Skeleton className="h-10 w-28 rounded-md" />
                   </div>
                   <div className="flex justify-end pt-4">
                     <Skeleton className="h-10 w-32 rounded-full" />
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
                  className="rounded-md"
                />
                 <p className="text-xs text-muted-foreground">Max 80 characters. Clear and concise.</p>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select onValueChange={setCategory} value={category} required disabled={isSaving || isDeleting}>
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
                  disabled={isSaving || isDeleting}
                  className="rounded-md"
                />
                 <p className="text-xs text-muted-foreground">Explain what you offer, your process, and deliverables.</p>
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
                     disabled={isSaving || isDeleting}
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
                       disabled={isSaving || isDeleting}
                        className="rounded-md"
                     />
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Service Image</Label>
                 <div className="flex items-center gap-4">
                    <div className="relative w-32 h-20 rounded-lg border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                         {(imagePreview || existingImageUrl) ? (
                           <Image
                                src={imagePreview || existingImageUrl!}
                                alt={imagePreview ? "New preview" : "Current service image"}
                                fill
                                style={{ objectFit: 'cover' }}
                                data-ai-hint={imagePreview ? "upload preview" : "service visual design"}
                            />
                         ) : ( // Fallback icon if no image exists at all
                           <ImageIcon className="h-8 w-8 text-muted-foreground" /> // Use renamed import
                         )}
                    </div>
                    <Input
                     id="image"
                     type="file"
                     accept="image/png, image/jpeg, image/webp"
                     // Not required on edit
                     onChange={handleImageChange}
                     className="hidden" // Keep hidden, trigger via button
                     disabled={isSaving || isDeleting}
                    />
                   <Button type="button" variant="outline" onClick={() => document.getElementById('image')?.click()} disabled={isSaving || isDeleting} className="rounded-full">
                     <Upload className="mr-2 h-4 w-4"/>
                     {existingImageUrl || imagePreview ? "Change Image" : "Upload Image"}
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground">Upload a new image (JPG, PNG, WEBP, max 5MB) to replace the current one (optional).</p>
              </div>

              <div className="flex justify-end pt-4">
                 <Button type="submit" disabled={isSaving || isLoading || isDeleting} className="rounded-full shadow-md hover:shadow-lg transition-shadow">
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
