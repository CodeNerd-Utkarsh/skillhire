// scripts/sync-db.ts
import { syncModels, sequelize } from '../src/models'; // Adjust path based on your structure
import { testDbConnection } from '../src/lib/db';

async function runSync() {
  console.log('Attempting to connect to the database...');
  try {
    await testDbConnection(); // Test connection first
    console.log('\nAttempting to synchronize database models...');
    await syncModels(); // Sync models (force: true in dev)
    console.log('\nDatabase synchronization complete.');
  } catch (error) {
    console.error('\nDatabase synchronization failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await sequelize.close(); // Close the connection
    console.log('\nDatabase connection closed.');
  }
}

runSync();
