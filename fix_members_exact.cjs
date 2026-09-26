const fs = require('fs');
let s = fs.readFileSync('server/routes/members.ts', 'utf8');

const lines = s.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("memberType: z.enum")) {
    lines[i] = "  memberType: z.enum(['CỐ ĐỊNH', 'VÃNG LAI']),";
  }
}
s = lines.join('\n');
fs.writeFileSync('server/routes/members.ts', s, 'utf8');
console.log('Fixed members.ts');
