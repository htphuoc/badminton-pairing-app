import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// createTables is no longer needed because we will use drizzle-kit push
export function createTables() {
  console.log("createTables() is obsolete with Drizzle Push. Schema is maintained by Drizzle Kit.");
}
