const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const games = path.join(root, 'games');

// Tests belong beside their game, but never in the published site.
const copyOptions = {
  recursive: true,
  filter: (source) =>
    !['tests', '__tests__', 'node_modules'].includes(path.basename(source)) &&
    !(
      source.includes(`${path.sep}games${path.sep}afterhours-garage${path.sep}assets${path.sep}cars${path.sep}`) &&
      source.endsWith('.zip')
    ) &&
    !/\.(test|spec)\.[cm]?js$/.test(source),
};

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(root, 'public'), output, copyOptions);
fs.mkdirSync(path.join(output, 'games'), { recursive: true });

for (const entry of fs.readdirSync(games, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const gameSource = path.join(games, entry.name);
  if (!fs.existsSync(path.join(gameSource, 'index.html'))) continue;

  fs.cpSync(gameSource, path.join(output, 'games', entry.name), copyOptions);
}

console.log('Built static site in dist/.');
