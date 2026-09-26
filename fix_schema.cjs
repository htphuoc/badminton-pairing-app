const fs = require('fs');

// Fix schema.ts
let schema = fs.readFileSync('server/db/schema.ts', 'utf8');
schema = schema.replace(/enum:\s*\['Ä Ã”I NAM',\s*'Ä Ã”I Ná»®',\s*'Ä Ã”I NAM Ná»®',\s*'Tá»° DO'\]/, "enum: ['ĐÔI NAM', 'ĐÔI NỮ', 'ĐÔI NAM NỮ', 'TỰ DO']");
schema = schema.replace(/default\('Tá»° DO'\)/g, "default('TỰ DO')");
fs.writeFileSync('server/db/schema.ts', schema, 'utf8');

// Fix SessionPage.tsx button text
let page = fs.readFileSync('src/pages/SessionPage.tsx', 'utf8');
page = page.replace(
  />\s*BẮT ĐẦU\s*<\/button>/g,
  `>
                      {creatingSession ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                    </button>`
);
fs.writeFileSync('src/pages/SessionPage.tsx', page, 'utf8');

console.log('Fixed schema and SessionPage');
