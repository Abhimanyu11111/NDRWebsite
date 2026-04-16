// models/associations.js
import User from './User.js';
import Booking from './Booking.js';
import Room from './Room.js';
import Payment from './Payment.js';
import DatasetLock from './DatasetLock.js';
import Notification from './Notification.js';

// ==========================================
// USER ASSOCIATIONS
// ==========================================
User.hasMany(Booking, {
  foreignKey: "user_id",
  as: "bookings"
});

User.hasMany(Payment, {
  foreignKey: "user_id",
  as: "payments"
});

User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});

// ==========================================
// BOOKING ASSOCIATIONS
// ==========================================
Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

Booking.belongsTo(Room, {
  foreignKey: "room_id",
  as: "room"
});

Booking.hasMany(DatasetLock, {
  foreignKey: "booking_id",
  sourceKey: "booking_id",
  as: "datasetLocks"
});

// ==========================================
// SLOT (ROOM) ASSOCIATIONS
// ==========================================
Room.hasMany(Booking, {
  foreignKey: "room_id",
  as: "bookings"
});

// ==========================================
// PAYMENT ASSOCIATIONS
// ==========================================
Payment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user"
});

Payment.belongsTo(Booking, {
  foreignKey: "booking_id",
  targetKey: "booking_id",
  as: "booking"
});

// ==========================================
// DATASET LOCK ASSOCIATIONS
// ==========================================
DatasetLock.belongsTo(Booking, {
  foreignKey: "booking_id",
  targetKey: "booking_id",
  as: "booking"
});

// ==========================================
// NOTIFICATION ASSOCIATIONS
// ==========================================
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Export all models
export {
  User,
  Booking,
  Room,
  Payment,
  DatasetLock,
  Notification
};
