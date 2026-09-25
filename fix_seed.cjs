const fs = require('fs');

let seed = fs.readFileSync('server/db/seed.ts', 'utf8');

// Postgres Drizzle returns arrays directly. So .all() and .get() are not used for postgres-js by default?
// Wait, no. postgres-js does not have .all(). We just await the query.
// For sqlite, it's db.select().from(users).all(). For postgres it's await db.select().from(users).
seed = seed.replace(/\.all\(\)/g, "");
seed = seed.replace(/const existing = db\.select\(\)\.from\(users\)/g, "const existing = await db.select().from(users)");

// Replace .run() with .execute() or just await
seed = seed.replace(/\.run\(\)/g, "");
seed = seed.replace(/db\.insert/g, "await db.insert");

// Remove createTables()
seed = seed.replace(/createTables\(\);/g, "");

// Fix 'CỐ ĐỊNH' encoding if it's messed up
seed = seed.replace(/C\?\?\?\?SNH/g, "CỐ ĐỊNH");
seed = seed.replace(/VA\?\?NG LAI/g, "VÃNG LAI");
seed = seed.replace(/C[^\w\s]*D[^\w\s]*NH/g, 'CỐ ĐỊNH');
seed = seed.replace(/VA[^\w\s]*NG LAI/g, 'VÃNG LAI');

fs.writeFileSync('server/db/seed.ts', seed, 'utf8');
