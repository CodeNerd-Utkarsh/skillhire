
import { syncModels, sequelize } from '../src/models';
import { testDbConnection } from '../src/lib/db';

async function runSync() {
  console.log('Attempting to connect to the database...');
  try {
    await testDbConnection();
    console.log('\nAttempting to synchronize database models...');
    await syncModels();
    console.log('\nDatabase synchronization complete.');
  } catch (error) {
    console.error('\nDatabase synchronization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

runSync();
