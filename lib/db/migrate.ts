import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in the environment');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('⏳ Running migrations...');
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');
  } finally {
    await connection.end();
    console.log('Database connection closed after migration.');
  }
};

runMigrate()
  .then(() => {
    console.log('Migration script finished successfully.');
  })
  .catch((err) => {
    console.error('❌ Migration failed');
    console.error(err);
    throw err;
  });
