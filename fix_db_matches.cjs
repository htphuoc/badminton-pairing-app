const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

async function fix() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  await sql`UPDATE matches SET match_type = 'ĐÔI NAM' WHERE match_type = 'Ä Ã”I NAM'`;
  await sql`UPDATE matches SET match_type = 'ĐÔI NỮ' WHERE match_type = 'Ä Ã”I Ná»®'`;
  await sql`UPDATE matches SET match_type = 'ĐÔI NAM NỮ' WHERE match_type = 'Ä Ã”I NAM Ná»®'`;
  await sql`UPDATE matches SET match_type = 'TỰ DO' WHERE match_type = 'Tá»° DO'`;
  console.log('Fixed matches in DB');
  process.exit(0);
}
fix();
