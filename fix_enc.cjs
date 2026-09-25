const fs = require('fs');

let schema = fs.readFileSync('server/db/schema.ts', 'utf8');

schema = schema.replace(/C\?\?\?\?SNH/g, "CỐ ĐỊNH");
schema = schema.replace(/VA\?\?NG LAI/g, "VÃNG LAI");
schema = schema.replace(/C[^\w\s]*D[^\w\s]*NH/g, 'CỐ ĐỊNH');
schema = schema.replace(/VA[^\w\s]*NG LAI/g, 'VÃNG LAI');
schema = schema.replace(/\?A"I NAM Nr/g, 'ĐÔI NAM NỮ');
schema = schema.replace(/\?A"I NAM/g, 'ĐÔI NAM');
schema = schema.replace(/\?A"I Nr/g, 'ĐÔI NỮ');
schema = schema.replace(/T DO/g, 'TỰ DO');

fs.writeFileSync('server/db/schema.ts', schema, 'utf8');
console.log("Encoding fixed");
