import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, ForeignKey } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { User } from './user';
import type { Order } from './order';

interface ServiceAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  imageUrl: string | null;
  status: 'active' | 'paused' | 'draft';
  freelancerId: ForeignKey<User['id']>;
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


  public getFreelancer!: BelongsToGetAssociationMixin<User>;
  public readonly freelancer?: User;
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
      type: DataTypes.STRING(80),
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


      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 500,
      },
    },
    deliveryTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
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
        isUrl: true,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'draft'),
      allowNull: false,
      defaultValue: 'draft',
    },

  },
  {
    sequelize,
    tableName: 'services',
    timestamps: true,
    underscored: true,
  }
);
