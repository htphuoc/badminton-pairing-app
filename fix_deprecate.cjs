const fs = require('fs');
['tsconfig.json', 'api/tsconfig.json'].forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/"moduleResolution":\s*"node"/g, '"moduleResolution": "node", "ignoreDeprecations": "5.0"');
  fs.writeFileSync(f, c, 'utf8');
});
console.log('Fixed deprecation');
