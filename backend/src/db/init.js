import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

const dbPath =
  process.env.DATABASE_PATH ||
  join(projectRoot, 'data', 'city_reports.db');

/**
 * Δημιουργεί/ανοίγει τη βάση και εκτελεί το schema.
 * @returns {import('better-sqlite3').Database}
 */
export function initDatabase() {
  const dataDir = dirname(dbPath);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    fileURLToPath(pathToFileURL(process.argv[1]).href);

// Εκτέλεση απευθείας: npm run db:init
if (isDirectRun) {
  try {
    initDatabase();
    console.log(`Η βάση δεδομένων αρχικοποιήθηκε: ${dbPath}`);
  } catch (err) {
    console.error('Σφάλμα αρχικοποίησης βάσης:', err.message);
    process.exit(1);
  }
}
