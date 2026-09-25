const fs = require('fs');
let c = fs.readFileSync('server/db/schema.ts', 'utf8');

c = c.replace(/Cá»  Ä á»ŠNH/g, 'CỐ ĐỊNH');
c = c.replace(/VÃƒNG LAI/g, 'VÃNG LAI');
c = c.replace(/Ä Ã”I NAM/g, 'ĐÔI NAM');
c = c.replace(/Ä Ã”I Ná»®/g, 'ĐÔI NỮ');
c = c.replace(/Ä Ã”I NAM Ná»®/g, 'ĐÔI NAM NỮ');
c = c.replace(/Tá»° DO/g, 'TỰ DO');

fs.writeFileSync('server/db/schema.ts', c, 'utf8');
console.log('Fixed remaining enums');
