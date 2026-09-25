const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from 'uuid'")) {
        content = content.replace(/import \{ v4 as uuidv4 \} from 'uuid';\r?\n?/g, "import { randomUUID as uuidv4 } from 'crypto';\n");
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDir('server');
