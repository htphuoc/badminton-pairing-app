const fs = require('fs');

let content = fs.readFileSync('src/pages/SessionPage.tsx', 'utf8');

// Fix pendingSessionType useState
content = content.replace(/useState<.+ \w+ LAI. \| null>\(null\)/, "useState<'CỐ ĐỊNH' | 'VÃNG LAI' | null>(null)");

// Fix line 265 and 268 CỐ ĐỊNH
content = content.replace(/setPendingSessionType\([^)]+NH'\)/g, "setPendingSessionType('CỐ ĐỊNH')");
content = content.replace(/pendingSessionType === '[^']+NH'/g, "pendingSessionType === 'CỐ ĐỊNH'");

// Fix line 276 and 279 VÃNG LAI
content = content.replace(/setPendingSessionType\([^)]+LAI'\)/g, "setPendingSessionType('VÃNG LAI')");
content = content.replace(/pendingSessionType === '[^']+LAI'/g, "pendingSessionType === 'VÃNG LAI'");
content = content.replace(/pendingSessionType === '[^']+LAI' \? 'text-emerald/g, "pendingSessionType === 'VÃNG LAI' ? 'text-emerald");
content = content.replace(/pendingSessionType === '[^']+LAI' \? 'bg-emerald/g, "pendingSessionType === 'VÃNG LAI' ? 'bg-emerald");

fs.writeFileSync('src/pages/SessionPage.tsx', content, 'utf8');

let hook = fs.readFileSync('src/hooks/useSession.ts', 'utf8');
hook = hook.replace(/sessionType: '[^']+' \| '[^']+' = '[^']+'/g, "sessionType: 'CỐ ĐỊNH' | 'VÃNG LAI' = 'CỐ ĐỊNH'");
fs.writeFileSync('src/hooks/useSession.ts', hook, 'utf8');
