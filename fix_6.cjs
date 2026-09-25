const fs = require('fs');
['tsconfig.json', 'api/tsconfig.json'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/"5\.0"/g, '"6.0"');
  fs.writeFileSync(f, c, 'utf8');
});
console.log('Fixed deprecation to 6.0');
