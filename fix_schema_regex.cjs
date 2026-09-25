const fs = require('fs');
let c = fs.readFileSync('server/db/schema.ts', 'utf8');

c = c.replace(/memberType: text\('member_type', \{ enum: \[.*?\] \}/g, "memberType: text('member_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }");
c = c.replace(/sessionType: text\('session_type', \{ enum: \[.*?\] \}/g, "sessionType: text('session_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }");
c = c.replace(/matchType: text\('match_type', \{ enum: \[.*?\] \}/g, "matchType: text('match_type', { enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO'] }");

// Also fix the .default() that might have corrupted text
c = c.replace(/\.default\(['"].*?['"]\)/g, match => {
  if (match.includes('PLANNED') || match.includes('PLAYING') || match.includes('AUTO') || match.includes('WAITING') || match.includes('EQUAL')) return match;
  if (match.includes('C')) return ".default('CỐ ĐỊNH')";
  if (match.includes('T')) return ".default('TỰ DO')";
  return match;
});

fs.writeFileSync('server/db/schema.ts', c, 'utf8');
console.log('Fixed all enum regex');
