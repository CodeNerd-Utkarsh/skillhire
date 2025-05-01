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
import { ArrowLeft, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
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
import { getServiceForEditById, updateService, deleteService } from '@/services/service';
import { UserPayload } from '@/lib/auth';
import type { Service } from '@/models';


type ServiceFormData = Omit<Service, 'createdAt' | 'updatedAt' | 'freelancerId' | 'id'> & {
    price: string | number;
    deliveryTime: string | number;
    revisions: string | number;
};


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
  user: UserPayload | null;
}

export default function EditServicePage({ params, user }: EditServicePageProps) {
  const serviceId = params.id;
  const [formData, setFormData] = useState<Partial<ServiceFormData>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
      const fetchServiceData = async () => {
        if (!user || user.role !== 'freelancer') {
            toast({ title: "Unauthorized", description: "You cannot edit this service.", variant: "destructive" });
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
          const serviceData = await getServiceForEditById(serviceId);
          if (serviceData && serviceData.freelancerId === user.id) {
             setFormData({
                 title: serviceData.title,
                 description: serviceData.description,
                 category: serviceData.category,
                 price: (serviceData.price / 100).toFixed(2),
                 deliveryTime: serviceData.deliveryTime.toString(),
                 revisions: serviceData.revisions.toString(),
                 status: serviceData.status,
             });
            setExistingImageUrl(serviceData.imageUrl);
          } else {
             toast({ title: "Error", description: "Service not found or you don't have permission to edit it.", variant: "destructive" });
             setFormData({});
          }
        } catch (error) {
          console.error("Failed to fetch service data:", error);
          toast({ title: "Error", description: "Failed to load service details.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };

      fetchServiceData();
    }, [serviceId, toast, user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

   const handleSelectChange = (name: keyof ServiceFormData, value: string) => {
     setFormData(prev => ({ ...prev, [name]: value }));
   };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
         toast({ title: "Invalid File Type", description: "Please upload a PNG, JPG, or WEBP image.", variant: "destructive" });
         return;
      }
       if (file.size > 5 * 1024 * 1024) {
          toast({ title: "File Too Large", description: "Image size should not exceed 5MB.", variant: "destructive" });
          return;
       }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!user || user.role !== 'freelancer') {
         toast({ title: "Unauthorized", description: "You cannot save changes.", variant: "destructive" });
         return;
     }
    setIsSaving(true);


     if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.deliveryTime) {
         toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
         setIsSaving(false);
         return;
     }
     const priceInCents = Math.round(parseFloat(String(formData.price)) * 100);
     if (isNaN(priceInCents) || priceInCents < 500) {
         toast({ title: "Invalid Price", description: "Price must be a number and at least $5.00.", variant: "destructive" });
         setIsSaving(false);
         return;
     }
      const deliveryDays = parseInt(String(formData.deliveryTime));
      if (isNaN(deliveryDays) || deliveryDays < 1) {
         toast({ title: "Invalid Delivery Time", description: "Delivery time must be a whole number of at least 1 day.", variant: "destructive" });
         setIsSaving(false);
         return;
     }
      const numRevisions = formData.revisions ? parseInt(String(formData.revisions)) : 0;
       if (isNaN(numRevisions) || numRevisions < 0) {
         toast({ title: "Invalid Revisions", description: "Revisions must be a non-negative whole number.", variant: "destructive" });
         setIsSaving(false);
         return;
     }


    const updateData = new FormData();
    updateData.append('title', formData.title);
    updateData.append('description', formData.description);
    updateData.append('category', formData.category);
    updateData.append('price', priceInCents.toString());
    updateData.append('deliveryTime', deliveryDays.toString());
    updateData.append('revisions', numRevisions.toString());
     if (formData.status) {
        updateData.append('status', formData.status);
     }
    if (imageFile) {
      updateData.append('image', imageFile);
    }

    console.log("Saving changes for service:", serviceId);


    try {
        const result = await updateService(serviceId, updateData);
        if (result.error) {
            throw new Error(result.error);
        }

        toast({
            title: "Service Updated Successfully",
            description: `Changes to "${formData.title}" have been saved.`,
            variant: "default",
        });


       if (result.service?.imageUrl) {
          setExistingImageUrl(result.service.imageUrl);
          setImageFile(null);
          setImagePreview(null);
       }


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
      if (!user || user.role !== 'freelancer') {
         toast({ title: "Unauthorized", description: "You cannot delete this service.", variant: "destructive" });
         return;
      }
     setIsDeleting(true);
     console.log("Attempting to delete service:", serviceId);

     try {
        const result = await deleteService(serviceId);
        if (result.error) {
            throw new Error(result.error);
        }

        toast({
          title: "Service Deleted",
          description: `"${formData.title || 'Service'}" has been removed.`,
        });



         window.location.href = '/freelancer/dashboard';


     } catch (error: any) {
        console.error("Service deletion error:", error);
        toast({
          title: "Deletion Failed",
          description: error.message || "Could not delete the service. Please try again.",
          variant: "destructive",
        });
         setIsDeleting(false);
     }

 };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Header user={user} />
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

              <AlertDialog onOpenChange={(open) => !open && setIsDeleting(false)}>
                 <AlertDialogTrigger asChild>
                   <Button variant="destructive" size="sm" disabled={isLoading || isSaving || isDeleting || Object.keys(formData).length === 0} className="rounded-full">
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
            ) : Object.keys(formData).length === 0 ? (
                 <p className="text-center text-muted-foreground">Service not found or you do not have permission to edit it.</p>
            ) : (
            <form onSubmit={handleSaveChanges} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., I will design a professional logo for your brand"
                  required
                  value={formData.title || ''}
                  onChange={handleInputChange}
                  maxLength={80}
                  disabled={isSaving || isDeleting}
                  className="rounded-md"
                />
                 <p className="text-xs text-muted-foreground">Max 80 characters. Clear and concise.</p>
              </div>


              <div className="space-y-2">
                 <Label htmlFor="category">Category</Label>
                 <Select
                    onValueChange={(value) => handleSelectChange('category', value)}
                    value={formData.category || ''}
                    required
                    disabled={isSaving || isDeleting}
                 >
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
                  name="description"
                  placeholder="Describe your service in detail..."
                  required
                  rows={5}
                  value={formData.description || ''}
                  onChange={handleInputChange}
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
                     name="price"
                     type="number"
                     placeholder="e.g., 50.00"
                     required
                     min="5.00" step="0.01"
                     value={formData.price || ''}
                     onChange={handleInputChange}
                     disabled={isSaving || isDeleting}
                     className="rounded-md"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="deliveryTime">Delivery Time (Days)</Label>
                   <Input
                     id="deliveryTime"
                     name="deliveryTime"
                     type="number"
                     placeholder="e.g., 3"
                     required
                     min="1" step="1"
                     value={formData.deliveryTime || ''}
                     onChange={handleInputChange}
                     disabled={isSaving || isDeleting}
                      className="rounded-md"
                   />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="revisions">Revisions</Label>
                     <Input
                       id="revisions"
                       name="revisions"
                       type="number"
                       placeholder="e.g., 2 (optional)"
                       min="0" step="1"
                       value={formData.revisions || ''}
                       onChange={handleInputChange}
                       disabled={isSaving || isDeleting}
                        className="rounded-md"
                     />
                  </div>
              </div>


             <div className="space-y-2">
                 <Label htmlFor="status">Service Status</Label>
                 <Select
                    onValueChange={(value) => handleSelectChange('status', value as 'active' | 'paused' | 'draft')}
                    value={formData.status || 'draft'}
                    required
                    disabled={isSaving || isDeleting}
                 >
                   <SelectTrigger id="status" className="rounded-md">
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="active">Active (Visible to Clients)</SelectItem>
                     <SelectItem value="paused">Paused (Hidden from Marketplace)</SelectItem>
                     <SelectItem value="draft">Draft (Not Visible)</SelectItem>
                   </SelectContent>
                 </Select>
                 <p className="text-xs text-muted-foreground">Control the visibility of your service.</p>
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
                         ) : (
                           <ImageIcon className="h-8 w-8 text-muted-foreground" />
                         )}
                    </div>
                    <Input
                     id="image"
                     type="file"
                     accept="image/png, image/jpeg, image/webp"
                     onChange={handleImageChange}
                     className="hidden"
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


