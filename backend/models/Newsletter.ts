import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface NewsletterAttributes {
  id: number;
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsletterCreationAttributes extends Optional<NewsletterAttributes, 'id' | 'isActive' | 'subscribedAt' | 'unsubscribedAt' | 'createdAt' | 'updatedAt'> {}

class Newsletter extends Model<NewsletterAttributes, NewsletterCreationAttributes> implements NewsletterAttributes {
  public id!: number;
  public email!: string;
  public isActive!: boolean;
  public subscribedAt!: Date;
  public unsubscribedAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Newsletter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'newsletters',
    timestamps: true,
  }
);

export default Newsletter;
