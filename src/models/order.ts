import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, ForeignKey } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { User } from './user';
import type { Service } from './service';
import type { Payment } from './payment';

interface OrderAttributes {
  id: string;
  clientId: ForeignKey<User['id']>;
  freelancerId: ForeignKey<User['id']>;
  serviceId: ForeignKey<Service['id']>;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  dueDate: Date | null;
  totalAmount: number;
  requirements: string | null;
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


  public getClient!: BelongsToGetAssociationMixin<User>;
  public readonly client?: User;
  public getFreelancer!: BelongsToGetAssociationMixin<User>;
  public readonly freelancer?: User;
  public getService!: BelongsToGetAssociationMixin<Service>;
  public readonly service?: Service;
  public readonly payment?: Payment;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalAmount: {

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
