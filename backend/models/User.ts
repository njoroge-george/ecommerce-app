import { DataTypes, Model } from "sequelize";
import  sequelize  from "../config/db";

class User extends Model {
  declare id: number;
  declare name: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare password: string;
  declare phoneNumber: string;
  declare role: string;
  declare avatar: string;
  declare isVerified: boolean;
  declare isPremium: boolean;
  declare premiumSince: Date;
  declare premiumExpiresAt: Date;
}

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM("customer", "admin", "moderator"), defaultValue: "customer" },
  avatar: { type: DataTypes.STRING, allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
  premiumSince: { type: DataTypes.DATE, allowNull: true },
  premiumExpiresAt: { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
})

export default User;