const fs = require('fs');
let hook = fs.readFileSync('src/hooks/useSession.ts', 'utf8');

hook = hook.replace(
  "await ApiClient.post('/sessions', {",
  "const now = new Date();\n      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;\n      await ApiClient.post('/sessions', {\n        sessionDate: localDateStr,\n        plannedDurationMinutes: durationMinutes,"
);

fs.writeFileSync('src/hooks/useSession.ts', hook, 'utf8');
