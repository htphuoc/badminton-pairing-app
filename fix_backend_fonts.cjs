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
  
  // Replace Zod enums and corrupted strings
  c = c.replace(/CÃ¡Â»Â  Ã„Â Ã¡Â»Å NH/g, 'CỐ ĐỊNH');
  c = c.replace(/VÃƒÆ’NG LAI/g, 'VÃNG LAI');
  
  c = c.replace(/Cá»  Ä á»ŠNH/g, 'CỐ ĐỊNH');
  c = c.replace(/VÃƒNG LAI/g, 'VÃNG LAI');

  if (original !== c) {
    fs.writeFileSync(f, c, 'utf8');
    console.log(`Fixed ${f}`);
  }
});
