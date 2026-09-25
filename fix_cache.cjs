const fs = require('fs');
let c = fs.readFileSync('src/lib/api.ts', 'utf8');
c = c.replace(
  'const response = await fetch(`${API_BASE_URL}${endpoint}`, {',
  'const response = await fetch(`${API_BASE_URL}${endpoint}${endpoint.includes(\'?\') ? \'&\' : \'?\'}nocache=${Date.now()}`, { cache: \'no-store\', '
);
fs.writeFileSync('src/lib/api.ts', c, 'utf8');
console.log('Done');
