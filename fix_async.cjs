const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('server');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // db.select().from(X).all() -> await db.select().from(X)
  // BUT we must make sure it's awaited! In Express route handlers it might already be awaited?
  // Wait, in SQLite it was sync: const users = db.select().from(users).all();
  // So I must add await!
  content = content.replace(/db\.select\(\)([^;]+?)\.all\(\)/g, "await db.select()$1");
  content = content.replace(/db\.select\(\)([^;]+?)\.get\(\)/g, "(await db.select()$1)[0]");
  
  // db.insert(X).values(Y).run() -> await db.insert(X).values(Y)
  content = content.replace(/db\.insert\(([^)]+)\)\.values\(([^)]+)\)\.run\(\)/g, "await db.insert($1).values($2)");
  // db.update(X).set(Y).where(Z).run() -> await db.update(X).set(Y).where(Z)
  content = content.replace(/db\.update\(([^)]+)\)\.set\(([^)]+)\)\.where\(([^)]+)\)\.run\(\)/g, "await db.update($1).set($2).where($3)");

  // Replace json/array helpers
  // In postgres, we can store JSON natively.
  // We'll replace the manual p/j helpers if they are there, but wait, they might be custom functions in index.ts. Let's not touch them for now to avoid breaking complex logic.

  // Add async to map if needed? No, map with await inside won't work easily.
  // Wait, if it was `users.map(u => { const foo = db.select().get(); return foo; })` -> it must become Promise.all
  // Let's check where .get() and .all() were used inside loops.
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  }
});
