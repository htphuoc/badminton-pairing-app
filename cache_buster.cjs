const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
c = c.replace(/src="\/logo\.png"/g, 'src="/logo.png?v=2"');
c = c.replace(/src="\/logo\.png\?v=2\?v=2"/g, 'src="/logo.png?v=2"'); // Just in case
fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');

c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/src="\/logo\.png"/g, 'src="/logo.png?v=2"');
c = c.replace(/src="\/logo\.png\?v=2\?v=2"/g, 'src="/logo.png?v=2"');
fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('Added cache busters');
