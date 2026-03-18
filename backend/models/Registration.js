// models/Registration.js
import { DataTypes } from 'sequelize';
import sequelize from '../src/config/db.js';

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  job_title: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  org_type: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  org_name: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING',
    allowNull: false
  }
}, {
  tableName: 'registrations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Registration;