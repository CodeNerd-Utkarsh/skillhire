import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { Eye, MessageSquare, ShoppingBag, Star } from 'lucide-react';

// TODO: Fetch actual data for the logged-in client
const mockOrders = [
  { id: 101, serviceTitle: "Modern Web App Development", freelancer: "Jane Doe", status: "In Progress", dueDate: "2024-08-15", price: 120000 }, // Price in cents
  { id: 102, serviceTitle: "Brand Identity Design", freelancer: "John Smith", status: "Delivered", dueDate: "2024-07-28", price: 80000 },
  { id: 103, serviceTitle: "Technical Article Writing", freelancer: "Alice Green", status: "Completed", dueDate: "2024-07-10", price: 25000 },

];

export default function ClientDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Client Dashboard</h1>
          <Link href="/services" passHref>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <ShoppingBag className="mr-2 h-4 w-4" /> Browse Services
            </Button>
          </Link>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>Track and manage your purchased services.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.length > 0 ? (
                  mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.serviceTitle}</TableCell>
                      <TableCell>{order.freelancer}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs ${
                           order.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                           order.status === 'Delivered' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                           order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                           'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                         }`}>
                           {order.status}
                         </span>
                      </TableCell>
                      <TableCell>{order.dueDate}</TableCell>
                      <TableCell>${(order.price / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Link href={`/client/orders/${order.id}`} passHref>
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                           <Button variant="ghost" size="icon" title="Contact Freelancer">
                               <MessageSquare className="h-4 w-4" />
                           </Button>
                           {order.status === 'Completed' && (
                               <Button variant="ghost" size="icon" title="Leave Review">
                                   <Star className="h-4 w-4" />
                               </Button>
                           )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      You haven't placed any orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>


        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Saved Services</CardTitle>
            <CardDescription>Your bookmarked services for later.</CardDescription>
          </CardHeader>
          <CardContent>

            <p className="text-muted-foreground">You haven't saved any services yet.</p>
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
