const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

c = c.replace(
  '<div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">Đã thu / Tổng</div>',
  ''
);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('Removed text');
