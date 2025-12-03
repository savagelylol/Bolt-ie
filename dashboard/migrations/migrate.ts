import db from '../src/server/db/knex';
import { up as initialSchema } from './001_initial_schema';

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    await initialSchema(db);
    
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
