const fs = require('fs');

let s = fs.readFileSync('server/routes/sessions.ts', 'utf8');
s = s.replace(/Cá»\s*Ä\s*á»ŠNH/g, 'CỐ ĐỊNH');
s = s.replace(/Cï¿½\s*ï¿½NH/g, 'CỐ ĐỊNH');
s = s.replace(/VÃƒNG LAI/g, 'VÃNG LAI');
s = s.replace(/Tá»° DO/g, 'TỰ DO');
s = s.replace(/Kh[^\']*xáº¿p tráº­n/g, 'Không đủ 4 người chờ để xếp trận');
s = s.replace(/KhA'ng[^\']*xp tr-n/g, 'Không đủ 4 người chờ để xếp trận');
s = s.replace(/Kh[^\']*x.p tr.-n/g, 'Không đủ 4 người chờ để xếp trận');

// Ensure we fix the 404 exactly
const badStr1 = "error: 'Kh";
if (s.includes(badStr1)) {
  const lines = s.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("res.status(404).json({ error: 'Kh")) {
      lines[i] = "    res.status(404).json({ error: 'Không đủ 4 người chờ để xếp trận' });";
    }
  }
  s = lines.join('\n');
}

fs.writeFileSync('server/routes/sessions.ts', s, 'utf8');
console.log('Fixed sessions.ts globally');
