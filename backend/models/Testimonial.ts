import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface TestimonialAttributes {
  id: number;
  userId?: number;
  name: string;
  email: string;
  role?: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  isVisible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TestimonialCreationAttributes extends Optional<TestimonialAttributes, 'id' | 'userId' | 'role' | 'isApproved' | 'isVisible' | 'createdAt' | 'updatedAt'> {}

class Testimonial extends Model<TestimonialAttributes, TestimonialCreationAttributes> implements TestimonialAttributes {
  public id!: number;
  public userId?: number;
  public name!: string;
  public email!: string;
  public role?: string;
  public comment!: string;
  public rating!: number;
  public isApproved!: boolean;
  public isVisible!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Testimonial.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Customer',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'testimonials',
    timestamps: true,
  }
);

export default Testimonial;
