const fs = require('fs');

let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');
s = s.replace('Cá»  Ä á»ŠNH', 'CỐ ĐỊNH');
s = s.replace('VÃƒNG LAI', 'VÃNG LAI');
s = s.replace('Cá»  Ä á»ŠNH', 'CỐ ĐỊNH');
s = s.replace('Tá»° DO', 'TỰ DO');
s = s.replace('KhÃƒÂ´ng Ã„â€˜Ã¡Â»Â§ 4 ngÃ†Â°Ã¡Â»Â i chÃ¡Â»Â  Ã„â€˜Ã¡Â»Æ’ xÃ¡ÂºÂ¿p trÃ¡ÂºÂ­n', 'Không đủ 4 người chờ để xếp trận');
s = s.replace('KhÃ´ng Ä‘á»§ 4 ngÆ°á» i chá»  Ä‘á»ƒ xáº¿p tráº­n', 'Không đủ 4 người chờ để xếp trận');
fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');

let m = fs.readFileSync('server/routes/members.ts', 'utf8');
m = m.replace('VÃƒNG LAI', 'VÃNG LAI');
m = m.replace('Cá»  Ä á»ŠNH', 'CỐ ĐỊNH');
fs.writeFileSync('server/routes/members.ts', m, 'utf8');

let h = fs.readFileSync('server/db/schema.ts', 'utf8');
h = h.replace(/enum:\s*\['Ä Ã”I NAM',\s*'Ä Ã”I Ná»®',\s*'Ä Ã”I NAM Ná»®',\s*'Tá»° DO'\]/g, "enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO']");
h = h.replace(/default\('Tá»° DO'\)/g, "default('TỰ DO')");
h = h.replace('VÃƒNG LAI', 'VÃNG LAI');
h = h.replace('Cá»  Ä á»ŠNH', 'CỐ ĐỊNH');
fs.writeFileSync('server/db/schema.ts', h, 'utf8');

console.log('Fixed strings safely');
