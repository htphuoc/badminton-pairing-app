const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

const replacement = `{
                  (() => {
                    const breakdown = calcSessionCosts(s, id => players.find(p => p.id === id)?.gender);
                    const total = Math.round(breakdown.total);
                    const received = Math.round(breakdown.participants.filter(p => s.players?.find(sp => sp.playerId === p.playerId)?.hasPaid).reduce((sum, p) => sum + breakdown.owed(p), 0));
                    return (
                      <>
                        <div className="text-lg font-black text-teal-700 leading-tight">
                          {received.toLocaleString('vi-VN')}đ / {total.toLocaleString('vi-VN')}đ
                        </div>
                        {s.isFinalized && <div className="text-[11px] font-extrabold text-rose-600 mt-1 uppercase">Đã Khóa Sổ</div>}
                      </>
                    );
                  })()
                }`;

c = c.replace(/<div className="text-lg font-black text-teal-700 leading-tight">[\s\S]*?<\/div>/, replacement);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('HistoryPage list updated');
