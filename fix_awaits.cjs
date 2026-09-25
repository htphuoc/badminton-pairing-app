const fs = require('fs');
const p = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    f = p.join(dir, f);
    if (fs.statSync(f).isDirectory()) res = res.concat(walk(f));
    else if (f.endsWith('.ts')) res.push(f);
  });
  return res;
}

walk('server').forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let original = c;
  
  c = c.replace(/([ \t]+)(?<!await\s+)db\.(insert|update|delete)\(/g, '$1await db.$2(');
  
  if (original !== c) {
    fs.writeFileSync(f, c, 'utf8');
    console.log(`Fixed awaits in ${f}`);
  }
});
