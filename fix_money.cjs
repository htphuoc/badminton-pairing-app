const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

c = c.replace(
  /<div className="text-lg font-black text-teal-700 leading-tight">[\s\S]*?\{received\.toLocaleString\('vi-VN'\)\}đ \/ \{total\.toLocaleString\('vi-VN'\)\}đ[\s\S]*?<\/div>/,
  `<div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-tight">Đã thu / Tổng</div>
                          <div className="text-base font-black text-teal-700 leading-tight whitespace-nowrap">
                            <span className="text-emerald-600">{received.toLocaleString('vi-VN')}đ</span>
                            <span className="text-gray-300 mx-1">/</span>
                            {total.toLocaleString('vi-VN')}đ
                          </div>
                        </div>`
);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('HistoryPage money updated');
