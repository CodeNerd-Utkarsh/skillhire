'use server';

import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log queries in development
  dialectOptions: {
    // Add SSL options if required for your PostgreSQL setup (e.g., on cloud providers)
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false // Adjust based on your certificate setup
    // }
  },
});

export async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Re-throw error to indicate failure
  }
}

// Optional: Export the instance directly if needed elsewhere,
// but models usually import this instance internally.
// export default sequelize;
