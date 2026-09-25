// Run from any directory: node scripts/build-pages.cjs
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { papers, selected } = JSON.parse(fs.readFileSync(path.join(root, 'data/publications.json'), 'utf8'));
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const link = (href, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${escape(href)}" target="_blank" rel="noopener">${escape(text)}</a>`;
const seen = new Set();
for (const paper of papers) {
  if (!paper.id || seen.has(paper.id)) throw new Error(`Duplicate or missing ID: ${paper.id}`);
  seen.add(paper.id);
  if (!paper.title || !paper.authorsHtml || !paper.venue) throw new Error(`Incomplete paper: ${paper.id}`);
  for (const field of ['acceptanceYear', 'publicationYear']) {
    if (paper[field] !== null && (!Number.isInteger(paper[field]) || paper[field] < 1900)) throw new Error(`Invalid ${field}: ${paper.id}`);
  }
  if (paper.href && paper.href.startsWith('./') && !fs.existsSync(path.join(root, paper.href))) throw new Error(`Missing PDF: ${paper.href}`);
}
function article(paper) {
  const year = paper.publicationYear || paper.acceptanceYear;
  const years = paper.acceptanceYear === null ? '' : ` data-acceptyear="${paper.acceptanceYear}" data-pubyear="${year}"`;
  return `<article class="paper" id="${escape(paper.id)}"${years} data-topics="${escape(paper.topics.join(' '))}">
  <h3 class="paper-title">${paper.href ? link(paper.href, paper.title) : escape(paper.title)}</h3>
  <p class="paper-authors">${paper.authorsHtml}</p>
  <p class="paper-venue">${escape(paper.venue)}${paper.award ? ` · <span class="award-label">${escape(paper.award)}</span>` : ''}</p>
  ${paper.details ? `<p class="paper-details">${escape(paper.details)}</p>` : ''}
  <div class="paper-links">${paper.href ? link(paper.href, paper.acceptanceYear === null ? 'arXiv' : 'PDF') : '<span class="pdf-pending">PDF forthcoming</span>'}</div>
</article>`;
}
function replaceBlock(file, name, content) {
  const filename = path.join(root, file);
  const source = fs.readFileSync(filename, 'utf8');
  const start = `<!-- BEGIN ${name} -->`, end = `<!-- END ${name} -->`;
  const a = source.indexOf(start), b = source.indexOf(end);
  if (a < 0 || b < a) throw new Error(`Missing ${name} markers in ${file}`);
  const result = (source.slice(0, a + start.length) + '\n' + content + '\n' + source.slice(b)).replace(/[\t ]+$/gm, '');
  if (process.argv.includes('--check')) {
    if (result.replace(/\r\n/g, '\n') !== source.replace(/\r\n/g, '\n')) throw new Error(`Generated content is stale in ${file}. Run node scripts/build-pages.cjs`);
  } else fs.writeFileSync(filename, result);
}
const preprints = papers.filter(p => p.acceptanceYear === null);
const years = [...new Set(papers.filter(p => p.acceptanceYear !== null).map(p => p.acceptanceYear))].sort((a,b) => b-a);
const preprintHTML = preprints.length ? `<section id="preprints" aria-labelledby="preprints-heading"><h2 class="year" id="preprints-heading">Preprints</h2>\n${preprints.map(article).join('\n')}\n</section>` : '';
replaceBlock('pubs.html', 'PUBLICATIONS', preprintHTML + '\n' + years.map(year => `<h2 class="year" id="y${year}">${year}</h2>\n` + papers.filter(p => p.acceptanceYear === year).map(article).join('\n')).join('\n'));
replaceBlock('pubs.html', 'YEAR INDEX', (preprints.length ? '<a href="#preprints">Preprints</a>\n' : '') + years.map(y => `<a href="#y${y}">${y}</a>`).join('\n'));
const selectedPapers = selected.map(id => {
  const paper = papers.find(p => p.id === id);
  if (!paper) throw new Error(`Unknown selected paper: ${id}`);
  return paper;
});
for (const [file, zh] of [['index.html', false], ['index-ch.html', true]]) {
  const rows = selectedPapers.map(p => {
    const year = p.publicationYear || p.acceptanceYear;
    const venue = p.venue.split(',')[0].replace(/\b\d{4}\b/, '').trim();
    return `<li class="selected-paper">
  <div class="selected-meta"><span class="selected-venue">${escape(venue)}</span><span class="selected-year">${year}</span></div>
  <h3 class="selected-heading">${p.href ? link(p.href, p.title, 'selected-title') : `<a class="selected-title" href="./pubs.html#${escape(p.id)}">${escape(p.title)}</a>`}</h3>
  <div class="selected-links">${p.href ? link(p.href, 'PDF ↗') : '<span class="pdf-pending">PDF forthcoming</span>'}<a href="./pubs.html#${escape(p.id)}">${zh ? '论文详情' : 'Details'} <span aria-hidden="true">→</span></a>${p.award ? `<span class="selected-award"><span aria-hidden="true">☆</span> ${escape(p.award)}</span>` : ''}</div>
</li>`;
  });
  replaceBlock(file, 'SELECTED PUBLICATIONS', `<ul class="list selected-list">\n${rows.join('\n')}\n</ul>\n<div class="selected-bottom"><span>${zh ? '期刊年份优先采用正式出版年份。' : 'Journal years use publication years where available.'}</span><a href="./pubs.html">${zh ? '查看完整论文列表 →' : 'View all publications →'}</a></div>`);
}
console.log(`Generated ${papers.length} publications and ${selected.length} selected publications in both languages.`);
