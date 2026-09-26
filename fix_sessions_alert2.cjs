const fs = require('fs');

let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');
s = s.replace(/KhÃ[^\']+/g, 'Không đủ 4 người chờ để xếp trận');
s = s.replace(/KhÃƒÂ´ng[^\']+/g, 'Không đủ 4 người chờ để xếp trận');
fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');
console.log('Fixed again');
