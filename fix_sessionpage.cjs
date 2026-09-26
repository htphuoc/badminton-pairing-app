const fs = require('fs');
let c = fs.readFileSync('src/pages/SessionPage.tsx', 'utf8');

c = c.replace(
  "const [pendingSessionType, setPendingSessionType] = useState<'CỐ ĐỊNH' | 'VÃNG LAI' | null>(null);",
  "const [pendingSessionType, setPendingSessionType] = useState<'CỐ ĐỊNH' | 'VÃNG LAI' | null>(null);\n  const [creatingSession, setCreatingSession] = useState(false);"
);

c = c.replace(
  /onClick=\{async \(\) => \{\s*try \{\s*await createSession\(courts, mins, ids, pendingSessionType\);\s*setPendingSessionType\(null\);\s*\} catch \(e: any\) \{\s*alert\('Lỗi tạo buổi chơi: ' \+ e\.message\);\s*\}\s*\}\}/,
  `disabled={creatingSession}
                    onClick={async () => {
                      if (creatingSession) return;
                      setCreatingSession(true);
                      try {
                        await createSession(courts, mins, ids, pendingSessionType);
                        setPendingSessionType(null);
                      } catch (e: any) {
                        alert('Lỗi tạo buổi chơi: ' + e.message);
                      } finally {
                        setCreatingSession(false);
                      }
                    }}`
);

c = c.replace(
  />\s*XÁC NHẬN\s*<\/button>/g,
  `>
                      {creatingSession ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                    </button>`
);

// Fix the match badge font weight
c = c.replace(
  /font-black px-2 py-0\.5/g,
  'font-bold px-2 py-0.5 font-sans'
);

fs.writeFileSync('src/pages/SessionPage.tsx', c, 'utf8');
console.log('SessionPage updated.');
