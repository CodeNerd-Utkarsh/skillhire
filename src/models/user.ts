import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '@/lib/db';
import type { Service } from './service'; // Import type for association
import type { Order } from './order'; // Import type for association

interface UserAttributes {
  id: string; // Use UUID or keep as string if using custom IDs
  name: string;
  email: string;
  passwordHash: string;
  role: 'client' | 'freelancer';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: 'client' | 'freelancer';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define associations here after initialization
  public readonly services?: Service[];
  public readonly orders?: Order[]; // Orders placed by client or received by freelancer
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('client', 'freelancer'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true, // Automatically add createdAt and updatedAt
    underscored: true, // Use snake_case for column names in the database
  }
);
