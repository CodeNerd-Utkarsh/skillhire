import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { Eye, MessageSquare, ShoppingBag, Star } from 'lucide-react';
import { Order, Service, User } from '@/models';
import { cookies } from 'next/headers';
import { verifyToken, type UserPayload } from '@/lib/auth';
import { Op } from 'sequelize';


async function getUserFromCookie(): Promise<UserPayload | null> {
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    if (!token) {
        return null;
    }
    return await verifyToken(token);
}

async function getClientData(userId: string) {
  try {
    const orders = await Order.findAll({
      where: { clientId: userId },
      include: [
        { model: Service, as: 'service', attributes: ['title'] },
        { model: User, as: 'freelancer', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']],
    });


    const savedServices: any[] = [];

    return { orders, savedServices };
  } catch (error) {
    console.error("Failed to fetch client dashboard data:", error);
    return { orders: [], savedServices: [] };
  }
}


export default async function ClientDashboard() {
  const user = await getUserFromCookie();

  if (!user || user.role !== 'client') {



      return (
        <div className="flex flex-col min-h-screen">
            <Header user={user} />
             <main className="flex-grow container mx-auto px-4 py-8">
                 <p>Unauthorized access or user not found.</p>
             </main>
            <Footer />
        </div>
      );
  }

  const { orders, savedServices } = await getClientData(user.id);


  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
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
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.service?.title || 'N/A'}</TableCell>
                      <TableCell>{order.freelancer?.name || 'N/A'}</TableCell>
                      <TableCell>
                         <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                           order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                           order.status === 'delivered' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                           order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                           order.status === 'pending' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                           order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                           order.status === 'disputed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                           'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                         }`}>
                           {order.status.replace('_', ' ')}
                         </span>
                      </TableCell>
                      <TableCell>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>${(order.totalAmount / 100).toFixed(2)}</TableCell>
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

                           {order.status === 'completed' && (
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
             {savedServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <p>Saved services display not implemented yet.</p>
                </div>
             ) : (
                <p className="text-muted-foreground">You haven't saved any services yet.</p>
             )}
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
