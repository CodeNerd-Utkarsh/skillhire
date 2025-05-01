import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, ForeignKey } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { Order } from './order'; // Import Order type

type PaymentProvider = 'stripe' | 'razorpay';
type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'requires_action' | 'refunded';

interface PaymentAttributes {
  id: string; // Use UUID
  orderId: ForeignKey<Order['id']>;
  provider: PaymentProvider;
  providerPaymentId: string; // e.g., Stripe Charge ID or Razorpay Payment ID
  amount: number; // Amount in cents
  currency: string; // e.g., 'usd', 'inr'
  status: PaymentStatus;
  metadata: object | null; // Store additional provider-specific data
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'metadata' | 'createdAt' | 'updatedAt'> {}

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public orderId!: ForeignKey<Order['id']>;
  public provider!: PaymentProvider;
  public providerPaymentId!: string;
  public amount!: number;
  public currency!: string;
  public status!: PaymentStatus;
  public metadata!: object | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public getOrder!: BelongsToGetAssociationMixin<Order>;
  public readonly order?: Order;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // orderId defined by association
    provider: {
      type: DataTypes.ENUM('stripe', 'razorpay'),
      allowNull: false,
    },
    providerPaymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure uniqueness per provider
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3), // ISO currency code
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'requires_action', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    metadata: {
      type: DataTypes.JSONB, // Use JSONB for better querying in PostgreSQL
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  }
);
