const fs = require('fs');
let c = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
c = c.replace(/TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c!/g, 'Tài khoản hoặc mật khẩu không chính xác!');
fs.writeFileSync('src/pages/LoginPage.tsx', c, 'utf8');
console.log('LoginPage updated');
