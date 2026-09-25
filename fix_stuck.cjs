const postgres = require('postgres');

async function fixStuckSessions() {
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    const result = await sql`
      UPDATE sessions
      SET status = 'FINISHED'
      WHERE status = 'RUNNING';
    `;
    console.log(`Updated ${result.count} stuck sessions to FINISHED.`);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

fixStuckSessions();
