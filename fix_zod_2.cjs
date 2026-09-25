const fs = require('fs');
let c = fs.readFileSync('server/routes/sessions.ts', 'utf8');
c = c.replace(/sessionType: z\.enum.+/g, "sessionType: z.enum(['CỐ ĐỊNH', 'VÃNG LAI']).default('CỐ ĐỊNH'),");
fs.writeFileSync('server/routes/sessions.ts', c, 'utf8');
console.log('Fixed');
