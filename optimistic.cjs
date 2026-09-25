const fs = require('fs');
let c = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');

c = c.replace(/const saveSessionSettings = async \(s: Session\) => \{[\s\S]*?fetchData\(\);[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\};/, 
  `const saveSessionSettings = async (s: Session) => {
    setSessions(prev => prev.map(x => x.id === s.id ? { ...x, shuttleCount: s.shuttleCount, isFinalized: s.isFinalized } : x));
    if (selected?.id === s.id) setSelected({ ...selected, shuttleCount: s.shuttleCount, isFinalized: s.isFinalized });
    try {
      await ApiClient.put(\`/sessions/\${s.id}\`, {
        shuttleCount: s.shuttleCount,
        isFinalized: s.isFinalized,
      });
    } catch (err) {
      console.error('Failed to update session settings', err);
      fetchData();
    }
  };`);

c = c.replace(/const updatePlayerPayment = async \(sessionId: string, playerId: string, hasPaid: boolean\) => \{[\s\S]*?fetchData\(\);[\s\S]*?catch \(err\) \{[\s\S]*?\}[\s\S]*?\};/, 
  `const updatePlayerPayment = async (sessionId: string, playerId: string, hasPaid: boolean) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        players: s.players?.map(p => p.playerId === playerId ? { ...p, hasPaid } : p)
      };
    }));
    if (selected?.id === sessionId) {
      setSelected(prev => prev ? {
        ...prev,
        players: prev.players?.map(p => p.playerId === playerId ? { ...p, hasPaid } : p)
      } : prev);
    }
    try {
      await ApiClient.put(\`/sessions/\${sessionId}/players/\${playerId}\`, { hasPaid });
    } catch (err) {
      console.error('Failed to update player payment', err);
      fetchData();
    }
  };`);

fs.writeFileSync('src/pages/HistoryPage.tsx', c, 'utf8');
console.log('Optimistic updates applied.');
