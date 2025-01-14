import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('sqlite.db');
const db = drizzle({ client: sqlite });

// Run migrations to create tables from schema
async function createDatabase() {
  try {
    console.log('Creating database and syncing schema...');
    await migrate(db, { migrationsFolder: '/migrations' });
    console.log('Database created successfully.');
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
}

createDatabase();