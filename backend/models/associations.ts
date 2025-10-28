import User from './User';
import Product from './Product';
import Rating from './Rating';
import Wishlist from './Wishlist';
import Order from './Order';
import OrderItem from './OrderItem';
import Address from './Address';

// User associations
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });

// Product associations
Product.hasMany(Rating, { foreignKey: 'productId', as: 'ratings' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlists' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Rating associations
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Address associations
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Product,
  Rating,
  Wishlist,
  Order,
  OrderItem,
  Address
};
