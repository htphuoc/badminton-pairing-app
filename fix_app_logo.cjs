const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/src="\/logo.jpg"/g, 'src="/logo.png"');
c = c.replace(/className="h-10 w-10 rounded-full object-cover ring-2 ring-primary\/30 shadow-sm"/g, 'className="h-12 w-12 object-contain"');
fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('App.tsx updated');
