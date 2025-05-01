import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, DollarSign, Users, BarChart, Eye, MessageSquare } from 'lucide-react';
import { Service, Order, User, Payment } from '@/models';
import { sequelize } from '@/lib/db';
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

async function getFreelancerData(userId: string) {
  try {

    const services = await Service.findAll({
      where: { freelancerId: userId },
      order: [['createdAt', 'DESC']],
    });


    const activeOrders = await Order.findAll({
        where: {
            freelancerId: userId,
            status: { [Op.in]: ['pending', 'in_progress', 'delivered'] }
        },
        include: [
            { model: Service, as: 'service', attributes: ['title'] },
            { model: User, as: 'client', attributes: ['name'] }
        ],
        order: [['dueDate', 'ASC'], ['createdAt', 'ASC']],
    });


    const totalEarningsResult = await Payment.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalEarnings']],
        where: { status: 'succeeded' },
        include: [{
            model: Order,
            as: 'order',
            required: true,
            where: { freelancerId: userId },
            attributes: []
        }],
        raw: true,
    });
    const totalEarnings = (totalEarningsResult?.totalEarnings as number) || 0;


    const completedOrdersCount = await Order.count({
        where: { freelancerId: userId, status: 'completed' }
    });


    return {
      stats: {
        earnings: totalEarnings,
        activeOrders: activeOrders.length,
        completedOrders: completedOrdersCount,
      },
      services,
      activeOrders,
    };

  } catch (error) {
    console.error("Failed to fetch freelancer dashboard data:", error);
    return { stats: { earnings: 0, activeOrders: 0, completedOrders: 0 }, services: [], activeOrders: [] };
  }
}


export default async function FreelancerDashboard() {
  const user = await getUserFromCookie();

  if (!user || user.role !== 'freelancer') {


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

  const { stats, services, activeOrders } = await getFreelancerData(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Freelancer Dashboard</h1>
          <Link href="/freelancer/services/new" passHref>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Service
            </Button>
          </Link>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.earnings / 100).toFixed(2)}</div>

            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
               <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>My Services</CardTitle>
            <CardDescription>Manage your service listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>



                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length > 0 ? (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                            service.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : service.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                          {service.status}
                        </span>
                      </TableCell>
                       <TableCell>${(service.price / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/freelancer/services/edit/${service.id}`} passHref>
                            <Button variant="ghost" size="icon" title="Edit Service">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete Service">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      You haven't created any services yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>


         <Card className="mt-8">
            <CardHeader>
                <CardTitle>Active Orders</CardTitle>
                 <CardDescription>View and manage your ongoing projects.</CardDescription>
            </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeOrders.length > 0 ? (
                            activeOrders.map((order) => (
                                <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.service?.title || 'N/A'}</TableCell>
                                <TableCell>{order.client?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    order.status === 'delivered' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    order.status === 'pending' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                    {order.status.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">

                                    <Link href={`/freelancer/orders/${order.id}`} passHref>
                                        <Button variant="ghost" size="icon" title="View Order">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                     <Button variant="ghost" size="icon" title="Contact Client">
                                        <MessageSquare className="h-4 w-4" />
                                     </Button>
                                    </div>
                                </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No active orders currently.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             </CardContent>
         </Card>

      </main>
      <Footer />
    </div>
  );
}
