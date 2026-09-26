const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

c = c.replace(
  /\{s\.sessionType === 'VÃNG LAI' \? 'Vãng lai' : 'Cố định'\}/,
  "{s.sessionType === 'VÃNG LAI' ? 'Vãng lai' : 'Cố định'}\n                </span>\n                {s.isFinalized && <span className=\"text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white ml-1\">Đã chốt</span>}"
);

c = c.replace(
  /\{s\.isFinalized && <div className="text-\[11px\] font-extrabold text-rose-600 mt-1 uppercase">Đã Khóa Sổ<\/div>\}/,
  ''
);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('HistoryPage badges updated');
