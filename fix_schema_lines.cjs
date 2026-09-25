const fs = require('fs');
let c = fs.readFileSync('server/db/schema.ts', 'utf8');

c = c.split('\n').map(l => {
  if (l.includes('memberType:')) {
    if (l.includes('notNull')) return "  memberType: text('member_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }).notNull(),";
    return "  memberType: text('member_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }),";
  }
  if (l.includes('sessionType:')) return "  sessionType: text('session_type', { enum: ['CỐ ĐỊNH', 'VÃNG LAI'] }).notNull().default('CỐ ĐỊNH'),";
  if (l.includes('matchType:')) return "  matchType: text('match_type', { enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO'] }).notNull().default('TỰ DO'),";
  return l;
}).join('\n');

fs.writeFileSync('server/db/schema.ts', c, 'utf8');
console.log('Fixed using lines');
