const fs = require('fs');

let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');
s = s.replace(/res\.status\(404\)\.json\(\{ error: 'Kh[^']*' \}\);/g, "res.status(404).json({ error: 'Không đủ 4 người chờ để xếp trận' });");
s = s.replace(/Cï¿½  ï¿½NH/g, 'CỐ ĐỊNH');
s = s.replace(/Vï¿½NG LAI/g, 'VÃNG LAI');
fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');

console.log('Fixed sessions.ts');
