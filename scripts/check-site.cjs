const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.join(__dirname, '..');
const { papers, selected } = require('../data/publications.json');
const { filterPapers, groupPapers } = require('../js/publications.js');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = ['index.html', 'index-ch.html', 'pubs.html'];
const ids = Object.fromEntries(files.map(file => [file, [...read(file).matchAll(/\bid="([^"]+)"/g)].map(m => m[1])]));
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
for (const file of files) {
  const html = read(file).replace(/<!--[\s\S]*?-->/g, '');
  assert.equal(ids[file].length, new Set(ids[file]).size, `Duplicate IDs: ${file}`);
  const stack = [];
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi)) {
    const tag = m[2].toLowerCase();
    if (voids.has(tag)) continue;
    if (m[1]) assert.equal(stack.pop(), tag, `${file}: mismatched closing ${tag}`);
    else stack.push(tag);
  }
  assert.equal(stack.length, 0, `${file}: unclosed tags`);
  assert.equal((html.match(/<main\b/g) || []).length, 1, `${file}: main landmark`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="/.test(m[0]), `${file}: missing image alternative`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = decode(m[1]);
    if (!url.startsWith('./') && !url.startsWith('#')) continue;
    const [target, fragment] = url.split('#');
    const targetFile = target ? target.replace(/^\.\//, '') : file;
    assert(fs.existsSync(path.join(root, targetFile)), `${file}: missing ${targetFile}`);
    if (fragment && ids[targetFile]) assert(ids[targetFile].includes(fragment), `${file}: missing anchor ${url}`);
  }
}
const html = read('pubs.html');
assert.equal((html.match(/<article class="paper"/g) || []).length, papers.length);
assert.equal((html.match(/PDF forthcoming/g) || []).length, papers.filter(p => !p.href).length);
for (const file of ['index.html', 'index-ch.html']) assert.equal((read(file).match(/class="selected-title"/g) || []).length, selected.length);
const searchable = papers.map(p => ({ ...p, searchText: decode([p.title, p.authorsHtml.replace(/<[^>]*>/g, ''), p.venue, p.details].join(' ')) }));
assert.equal(filterPapers(searchable, '', '').length, papers.length);
assert.equal(filterPapers(searchable, '  fOrEdRoId  Chen ', '')[0].id, 'paper-c59');
assert.equal(filterPapers(searchable, 'ForeDroid', 'malware').length, 1);
assert.equal(filterPapers(searchable, 'ForeDroid', 'supply-chain').length, 0);
assert.equal(filterPapers(searchable, 'zz-no-such-title-zz', '').length, 0);
for (const topic of ['','malware','supply-chain','analysis','ai','software']) {
  const filtered = filterPapers(searchable, '', topic);
  for (const mode of ['accept','pub']) {
    const grouped = groupPapers(filtered, mode);
    const flattened = grouped.preprints.concat(...grouped.years.map(y => grouped.groups[y]));
    assert.deepStrictEqual(flattened.map(p => p.id).sort(), filtered.map(p => p.id).sort());
    assert(grouped.years.every(Number.isFinite));
    assert(grouped.preprints.every(p => p.acceptanceYear === null));
  }
}
assert(groupPapers(searchable, 'accept').groups[2025].some(p => p.id === 'paper-j23'));
assert(groupPapers(searchable, 'pub').groups[2026].some(p => p.id === 'paper-j23'));
assert.equal(groupPapers([], 'pub').years.length, 0);
console.log(`PASS: ${papers.length} papers; valid HTML nesting, local links, fragments, selected works, search, topics, and both year groupings.`);
