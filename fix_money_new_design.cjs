const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

const regex = /<b className="text-primary text-sm">\{money\(costs\.total\)\}<\/b>/g;

const replacement = `{(() => {
                const received = Math.round(costs.participants.filter(p => s.players?.find(sp => sp.playerId === p.playerId)?.hasPaid).reduce((sum, p) => sum + costs.owed(p), 0));
                return (
                  <div className="text-right flex flex-col items-end">
                    <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">Đã thu / Tổng</div>
                    <div className="text-sm font-black text-primary whitespace-nowrap">
                      <span className="text-emerald-600">{money(received)}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      {money(costs.total)}
                    </div>
                  </div>
                );
              })()}`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
  console.log('Fixed money format correctly');
} else {
  console.log('Target not found');
}
