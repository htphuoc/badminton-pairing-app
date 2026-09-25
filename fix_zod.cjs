const fs = require('fs');

let c = fs.readFileSync('server/routes/sessions.ts', 'utf8');
c = c.replace(/z\.enum\(\[\s*['"].*?['"]\s*,\s*['"].*?['"]\s*\]\)/g, "z.enum(['CỐ ĐỊNH', 'VÃNG LAI'])");
fs.writeFileSync('server/routes/sessions.ts', c, 'utf8');

c = fs.readFileSync('server/db/schema.ts', 'utf8');
c = c.replace(/enum:\s*\[\s*['"].*?['"]\s*,\s*['"].*?['"]\s*\]/g, "enum: ['CỐ ĐỊNH', 'VÃNG LAI']");
fs.writeFileSync('server/db/schema.ts', c, 'utf8');
console.log('Fixed zod enums');
