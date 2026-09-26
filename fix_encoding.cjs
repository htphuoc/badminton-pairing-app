const fs = require('fs');

function fixDoubleEncoding(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Check if it's double encoded by looking for "Cá»  Ä á»ŠNH" or similar
  if (content.includes('Cá»') || content.includes('Ã')) {
    const buffer = Buffer.from(content, 'latin1');
    const fixedContent = buffer.toString('utf8');
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('Fixed', filePath);
  }
}

fixDoubleEncoding('server/routes/sessions.ts');
fixDoubleEncoding('src/pages/HistoryPage.tsx');
fixDoubleEncoding('src/pages/SessionPage.tsx');
fixDoubleEncoding('server/routes/members.ts');
fixDoubleEncoding('server/db/schema.ts');

