import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, ForeignKey } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { User } from './user';
import type { Service } from './service';
import type { Payment } from './payment'; // Import Payment type

interface OrderAttributes {
  id: string; // Use UUID or keep as string if using custom IDs
  clientId: ForeignKey<User['id']>;
  freelancerId: ForeignKey<User['id']>;
  serviceId: ForeignKey<Service['id']>;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  dueDate: Date | null;
  totalAmount: number; // In cents
  requirements: string | null; // Client requirements provided at purchase
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'dueDate' | 'requirements' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public clientId!: ForeignKey<User['id']>;
  public freelancerId!: ForeignKey<User['id']>;
  public serviceId!: ForeignKey<Service['id']>;
  public status!: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  public dueDate!: Date | null;
  public totalAmount!: number;
  public requirements!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations defined after init
  public getClient!: BelongsToGetAssociationMixin<User>;
  public readonly client?: User;
  public getFreelancer!: BelongsToGetAssociationMixin<User>;
  public readonly freelancer?: User;
  public getService!: BelongsToGetAssociationMixin<Service>;
  public readonly service?: Service;
  public readonly payment?: Payment; // HasOne association with Payment
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // clientId, freelancerId, serviceId defined by associations
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true, // Can be set after order confirmation/start
    },
    totalAmount: {
      // Store amount in cents to avoid floating point issues
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);
