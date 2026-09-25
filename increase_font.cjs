const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/className="text-xl font-extrabold text-primary tracking-wide"/g, 'className="text-3xl font-black text-primary tracking-widest drop-shadow-sm"');
fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('Fixed font size in App');
