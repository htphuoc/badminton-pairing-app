const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/<span className="text-xs mt-1">SÃƒÂ¢n<\/span>/g, '<span className="text-xs mt-1">Sân</span>');
c = c.replace(/<span className="text-xs mt-1">TÃ¡Â»â€¢ng kÃ¡ÂºÂ¿t<\/span>/g, '<span className="text-xs mt-1">Tổng kết</span>');
c = c.replace(/<span className="text-xs mt-1">ThÃƒÂ nh viÃƒÂªn<\/span>/g, '<span className="text-xs mt-1">Thành viên</span>');
c = c.replace(/<span className="text-xs mt-1">CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t<\/span>/g, '<span className="text-xs mt-1">Cài đặt</span>');
c = c.replace(/C\?U LONG 360/g, 'CẦU LÔNG 360°');
c = c.replace(/C\?u Lng 360/g, 'Cầu Lông 360°');

fs.writeFileSync('src/App.tsx', c, 'utf8');
console.log('App.tsx fonts fixed');
