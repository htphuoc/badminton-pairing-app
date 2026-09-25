const fs = require('fs');

let schema = fs.readFileSync('server/db/schema.ts', 'utf8');

// Replace sqlite imports with pg-core imports
schema = schema.replace(
  "import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';",
  "import { pgTable, text, integer, real, boolean, jsonb } from 'drizzle-orm/pg-core';"
);

// Replace all instances of sqliteTable with pgTable
schema = schema.replace(/sqliteTable/g, "pgTable");

// Replace integer('is_active', { mode: 'boolean' }).notNull().default(true) with boolean('is_active').notNull().default(true)
schema = schema.replace(/integer\('[^']+', \{ mode: 'boolean' \}\)/g, (match) => {
  const colName = match.match(/integer\('([^']+)'/)[1];
  return `boolean('${colName}')`;
});

schema = schema.replace(/integer\('has_paid', \{ mode: 'boolean' \}\)/g, "boolean('has_paid')");
schema = schema.replace(/integer\('is_supplemental', \{ mode: 'boolean' \}\)/g, "boolean('is_supplemental')");
schema = schema.replace(/integer\('is_finalized', \{ mode: 'boolean' \}\)/g, "boolean('is_finalized')");

// Fix Vietnamese characters
schema = schema.replace(/C[^\w\s]*D[^\w\s]*NH/g, 'CỐ ĐỊNH');
schema = schema.replace(/VA[^\w\s]*NG LAI/g, 'VÃNG LAI');

fs.writeFileSync('server/db/schema.ts', schema, 'utf8');

console.log("Schema rewritten!");
