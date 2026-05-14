import { Sequelize } from "sequelize";
import "./env.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // console spam off
    
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+05:30', // IST timezone
    
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  }
);

export default sequelize;
