import { User } from './user';
import { Service } from './service';
import { Order } from './order';
import { Payment } from './payment';
import { sequelize } from '@/lib/db';

// --- Define Associations ---

// User <-> Service (One-to-Many: Freelancer has many Services)
User.hasMany(Service, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'services', // Alias for accessing services from user instance
});
Service.belongsTo(User, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancer', // Alias for accessing freelancer from service instance
});

// User <-> Order (One-to-Many: Client places many Orders)
User.hasMany(Order, {
  foreignKey: { name: 'clientId', allowNull: false },
  as: 'clientOrders', // Alias for client's orders
});
Order.belongsTo(User, {
  foreignKey: { name: 'clientId', allowNull: false },
  as: 'client',
});

// User <-> Order (One-to-Many: Freelancer has many Orders)
User.hasMany(Order, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancerOrders', // Alias for freelancer's orders
});
Order.belongsTo(User, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancer',
});

// Service <-> Order (One-to-Many: Service can be part of many Orders)
Service.hasMany(Order, {
  foreignKey: { name: 'serviceId', allowNull: false },
  as: 'orders',
});
Order.belongsTo(Service, {
  foreignKey: { name: 'serviceId', allowNull: false },
  as: 'service',
});

// Order <-> Payment (One-to-One: Order has one Payment)
Order.hasOne(Payment, {
  foreignKey: { name: 'orderId', allowNull: false, unique: true },
  as: 'payment',
});
Payment.belongsTo(Order, {
  foreignKey: { name: 'orderId', allowNull: false },
  as: 'order',
});


// Function to sync models with the database
// Use with caution in production, consider migrations instead
export async function syncModels() {
  try {
    // await sequelize.sync({ alter: true }); // Use alter: true for non-destructive updates
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' }); // force: true drops tables - USE ONLY IN DEV
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database models:', error);
    throw error;
  }
}

// Re-export models for easier imports
export { User, Service, Order, Payment };
