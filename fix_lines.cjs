const fs = require('fs');

let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');

const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("res.status(404).json({ error: 'Kh")) {
    lines[i] = "    res.status(404).json({ error: 'Không đủ 4 người chờ để xếp trận' });";
  }
}
s = lines.join('\n');

fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');
console.log('Fixed 404 alert');
