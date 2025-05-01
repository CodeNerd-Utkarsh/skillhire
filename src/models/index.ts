import { User } from './user';
import { Service } from './service';
import { Order } from './order';
import { Payment } from './payment';
import { sequelize } from '@/lib/db';



User.hasMany(Service, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'services',
});
Service.belongsTo(User, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancer',
});


User.hasMany(Order, {
  foreignKey: { name: 'clientId', allowNull: false },
  as: 'clientOrders',
});
Order.belongsTo(User, {
  foreignKey: { name: 'clientId', allowNull: false },
  as: 'client',
});


User.hasMany(Order, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancerOrders',
});
Order.belongsTo(User, {
  foreignKey: { name: 'freelancerId', allowNull: false },
  as: 'freelancer',
});


Service.hasMany(Order, {
  foreignKey: { name: 'serviceId', allowNull: false },
  as: 'orders',
});
Order.belongsTo(Service, {
  foreignKey: { name: 'serviceId', allowNull: false },
  as: 'service',
});


Order.hasOne(Payment, {
  foreignKey: { name: 'orderId', allowNull: false, unique: true },
  as: 'payment',
});
Payment.belongsTo(Order, {
  foreignKey: { name: 'orderId', allowNull: false },
  as: 'order',
});



export async function syncModels() {
  try {

    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to synchronize the database models:', error);
    throw error;
  }
}


export { User, Service, Order, Payment };
