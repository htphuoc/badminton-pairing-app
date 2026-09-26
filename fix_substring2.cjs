const fs = require('fs');
let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');

const target = "res.status(404).json({ error: 'Kh";
const idx = s.indexOf(target);
if (idx !== -1) {
  const endIdx = s.indexOf("});", idx);
  if (endIdx !== -1) {
    s = s.substring(0, idx) + "res.status(404).json({ error: 'Không đủ 4 người chờ để xếp trận' " + s.substring(endIdx);
    fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');
    console.log('Fixed using looser end boundary');
  }
}
