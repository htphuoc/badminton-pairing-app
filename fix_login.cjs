const fs = require('fs');

let page = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

page = page.replace(
  /<div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">\s*<Trophy className="w-8 h-8 text-white" \/>\s*<\/div>/,
  '<div className="flex items-center justify-center mb-4 text-primary">\n<Trophy size={64} strokeWidth={1.5} />\n</div>'
);

page = page.replace(/setError\(err\.message \|\| 'Login failed'\);/, "setError('Tài khoản hoặc mật khẩu không chính xác!');");

fs.writeFileSync('src/pages/LoginPage.tsx', page, 'utf8');
console.log("LoginPage updated");
