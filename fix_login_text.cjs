const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const replacements = {
  'Máº­t kháº©u': 'Mật khẩu',
  'Nháº­p máº­t kháº©u': 'Nhập mật khẩu',
  'Ä ang xá»­ lÃ½...': 'Đang xử lý...',
  'Ä Äƒng nháº­p': 'Đăng nhập',
  'TÃªn Ä‘Äƒng nháº­p': 'Tên đăng nhập',
  'Cáº§u LÃ´ng 360Â°': 'Cầu Lông 360°',
  'Ä Äƒng nháº­p Ä‘á»ƒ quáº£n lÃ½ nhÃ³m': 'Đăng nhập để quản lý nhóm',
  'Nháº­p tÃªn Ä‘Äƒng nháº­p': 'Nhập tên đăng nhập',
  'TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c!': 'Tài khoản hoặc mật khẩu không chính xác!'
};

for (const [bad, good] of Object.entries(replacements)) {
  c = c.replace(new RegExp(bad, 'g'), good);
}

fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');
console.log('LoginPage fully updated');
