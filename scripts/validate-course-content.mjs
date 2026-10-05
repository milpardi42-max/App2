import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const canonical = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/essential504.json'), 'utf8'));
const files = fs.readdirSync(path.join(root, 'lib'))
  .filter((name) => /^courseContent.*\.ts$/.test(name))
  .map((name) => fs.readFileSync(path.join(root, 'lib', name), 'utf8'))
  .join('\n');
const tagged = [...files.matchAll(/word: '([^']+)', meaning: '[^']*', essential504: true/g)].map((match) => match[1]);
const canonicalSet = new Set(canonical);
const duplicate = [...new Set(tagged.filter((word, index) => tagged.indexOf(word) !== index))];
const outside = tagged.filter((word) => !canonicalSet.has(word));
const missing = canonical.filter((word) => !tagged.includes(word));
const lessonIds = [...files.matchAll(/id: '(?:foundation|survival|everyday|communication|advanced)-[^']+'/g)];

console.log(`Lessons: ${lessonIds.length}`);
console.log(`Canonical 504 coverage: ${tagged.length}/504`);
console.log(`Remaining: ${missing.length}`);
if (duplicate.length || outside.length) {
  if (duplicate.length) console.error(`Duplicate tagged words: ${duplicate.join(', ')}`);
  if (outside.length) console.error(`Words outside canonical list: ${outside.join(', ')}`);
  process.exit(1);
}
