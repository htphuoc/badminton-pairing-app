const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

const replacement = `{
                  (() => {
                    const breakdown = calcSessionCosts(s, id => players.find(p => p.id === id)?.gender);
                    const total = Math.round(breakdown.total);
                    const received = Math.round(breakdown.participants.filter(p => s.players?.find(sp => sp.playerId === p.playerId)?.hasPaid).reduce((sum, p) => sum + breakdown.owed(p), 0));
                    return (
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-tight">Đã thu / Tổng</div>
                        <div className="text-base font-black text-teal-700 leading-tight whitespace-nowrap">
                          <span className="text-emerald-600">{received.toLocaleString('vi-VN')}đ</span>
                          <span className="text-gray-300 mx-1">/</span>
                          {total.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    );
                  })()
                }`;

c = c.replace(/<div className="text-lg font-black text-teal-700 leading-tight">[\s\S]*?<\/div>/, replacement);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('HistoryPage money and list updated');
