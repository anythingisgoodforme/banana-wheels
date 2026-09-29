const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const games = path.join(root, 'games');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(root, 'public'), output, { recursive: true });
fs.mkdirSync(path.join(output, 'games'), { recursive: true });

for (const entry of fs.readdirSync(games, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const gameSource = path.join(games, entry.name);
  if (!fs.existsSync(path.join(gameSource, 'index.html'))) continue;

  fs.cpSync(gameSource, path.join(output, 'games', entry.name), { recursive: true });
}

console.log('Built static site in dist/.');