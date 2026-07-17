import './env';
import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy apps/backend/.env.example to apps/backend/.env and configure it.');
}

export const sequelize = new Sequelize(databaseUrl, {
  logging: false,
});
