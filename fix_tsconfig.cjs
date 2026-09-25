const fs = require('fs');
let c = fs.readFileSync('tsconfig.node.json', 'utf8');
c = c.replace(/"moduleResolution":\s*"nodenext"/gi, '"moduleResolution": "node"');
c = c.replace(/"module":\s*"nodenext"/gi, '"module": "esnext"');
c = c.replace(/"allowImportingTsExtensions": true,/gi, '"allowImportingTsExtensions": true, "moduleResolution": "bundler",');
fs.writeFileSync('tsconfig.node.json', c, 'utf8');
console.log('Fixed tsconfig');
