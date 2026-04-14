import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL env var required');
  process.exit(1);
}

const direction = process.argv[2];
if (direction !== 'up' && direction !== 'down') {
  console.error('Usage: tsx migrate.ts <up|down> [migration-number]');
  process.exit(1);
}

const specificMigration = process.argv[3];

async function main() {
  const sql = postgres(databaseUrl!, { max: 1 });
  const drizzleDir = join(import.meta.dirname, '..', 'drizzle');
  const files = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(direction === 'up' ? '.sql' : '.down.sql'))
    .filter((f) => direction === 'up' ? !f.endsWith('.down.sql') : true)
    .filter((f) => !specificMigration || f.startsWith(specificMigration))
    .sort((a, b) => (direction === 'up' ? a.localeCompare(b) : b.localeCompare(a)));

  console.log(`Running ${files.length} ${direction} migration(s)...`);

  for (const file of files) {
    const content = readFileSync(join(drizzleDir, file), 'utf-8');
    console.log(`\nRunning ${file}`);
    try {
      await sql.unsafe(content);
      console.log(`  OK`);
    } catch (err) {
      console.error(`  FAILED:`, err);
      await sql.end();
      process.exit(1);
    }
  }

  console.log(`\nAll migrations applied.`);
  await sql.end();
  process.exit(0);
}

main();
