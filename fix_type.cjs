const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');
c = c.replace(/padStart\(2, '0'\)} cố định/g, "padStart(2, '0')} {session.sessionType?.toLowerCase() === 'vãng lai' ? 'vãng lai' : 'cố định'}");
fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('Replaced');
