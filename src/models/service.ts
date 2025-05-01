import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, ForeignKey } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { User } from './user'; // Import type for association
import type { Order } from './order'; // Import type for association

interface ServiceAttributes {
  id: string; // Use UUID or keep as string if using custom IDs
  title: string;
  description: string;
  category: string;
  price: number; // Use INTEGER or DECIMAL based on precision needs
  deliveryTime: number; // In days
  revisions: number;
  imageUrl: string | null; // Path or URL to the image
  status: 'active' | 'paused' | 'draft';
  freelancerId: ForeignKey<User['id']>; // Foreign key referencing User model
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'imageUrl' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public price!: number;
  public deliveryTime!: number;
  public revisions!: number;
  public imageUrl!: string | null;
  public status!: 'active' | 'paused' | 'draft';
  public freelancerId!: ForeignKey<User['id']>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations here after initialization
  public getFreelancer!: BelongsToGetAssociationMixin<User>; // Method provided by belongsTo
  public readonly freelancer?: User; // Populated when using include
  public readonly orders?: Order[];
}

Service.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(80), // Add length limit if needed
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      // Consider DECIMAL(10, 2) for monetary values
      // type: DataTypes.DECIMAL(10, 2),
      type: DataTypes.INTEGER, // Using integer cents to avoid floating point issues
      allowNull: false,
      validate: {
        min: 500, // Minimum price in cents ($5.00)
      },
    },
    deliveryTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Minimum 1 day
      },
    },
    revisions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true, // Or use a custom validator for paths
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'draft'),
      allowNull: false,
      defaultValue: 'draft',
    },
    // freelancerId defined automatically by belongsTo association below
  },
  {
    sequelize,
    tableName: 'services',
    timestamps: true,
    underscored: true,
  }
);
