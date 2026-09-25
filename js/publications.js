(function (root) {
  'use strict';
  function filterPapers(papers, query, topic) {
    var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return papers.filter(function (paper) {
      return (!topic || paper.topics.indexOf(topic) !== -1) && words.every(function (word) {
        return paper.searchText.toLowerCase().indexOf(word) !== -1;
      });
    });
  }
  function groupPapers(papers, mode) {
    var preprints = [], groups = {};
    papers.forEach(function (paper) {
      if (paper.acceptanceYear === null) { preprints.push(paper); return; }
      var year = mode === 'pub' ? paper.publicationYear || paper.acceptanceYear : paper.acceptanceYear;
      if (!groups[year]) groups[year] = [];
      groups[year].push(paper);
    });
    return { preprints: preprints, groups: groups, years: Object.keys(groups).map(Number).sort(function (a, b) { return b - a; }) };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { filterPapers: filterPapers, groupPapers: groupPapers };
  if (!root.document) return;
  var document = root.document;
  var container = document.getElementById('papers-container');
  if (!container) return;
  var search = document.getElementById('paper-search');
  var topic = document.getElementById('paper-topic');
  var count = document.getElementById('paper-count');
  var toc = document.querySelector('.toc');
  var acceptButton = document.getElementById('sort-accept-btn');
  var pubButton = document.getElementById('sort-pub-btn');
  var mode = 'accept';
  var papers = Array.from(container.querySelectorAll('.paper')).map(function (node) {
    return { node: node, acceptanceYear: node.dataset.acceptyear ? Number(node.dataset.acceptyear) : null,
      publicationYear: node.dataset.pubyear ? Number(node.dataset.pubyear) : null,
      topics: node.dataset.topics.split(' '), searchText: node.textContent };
  });
  function element(tag, text, className) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function render() {
    var filtered = filterPapers(papers, search.value, topic.value);
    var grouped = groupPapers(filtered, mode);
    var content = document.createDocumentFragment();
    var links = document.createDocumentFragment();
    function indexLink(id, label) {
      var a = element('a', label); a.href = '#' + id; links.appendChild(a);
    }
    if (grouped.preprints.length) {
      var section = element('section'); section.id = 'preprints';
      section.setAttribute('aria-labelledby', 'preprints-heading');
      var heading = element('h2', 'Preprints', 'year'); heading.id = 'preprints-heading';
      section.appendChild(heading);
      grouped.preprints.forEach(function (paper) { section.appendChild(paper.node); });
      content.appendChild(section); indexLink('preprints', 'Preprints');
    }
    grouped.years.forEach(function (year) {
      var heading = element('h2', String(year), 'year'); heading.id = 'y' + year;
      content.appendChild(heading);
      grouped.groups[year].forEach(function (paper) { content.appendChild(paper.node); });
      indexLink('y' + year, String(year));
    });
    if (!filtered.length) content.appendChild(element('p', 'No matching publications. Try another keyword or clear the filters.', 'empty-state'));
    container.replaceChildren(content); toc.replaceChildren(links);
    toc.hidden = filtered.length === 0;
    count.textContent = 'Showing ' + filtered.length + ' of ' + papers.length + ' publications';
    acceptButton.classList.toggle('active', mode === 'accept');
    pubButton.classList.toggle('active', mode === 'pub');
    acceptButton.setAttribute('aria-pressed', String(mode === 'accept'));
    pubButton.setAttribute('aria-pressed', String(mode === 'pub'));
  }
  search.addEventListener('input', render); topic.addEventListener('change', render);
  document.getElementById('clear-filters').addEventListener('click', function () {
    search.value = ''; topic.value = ''; render(); search.focus();
  });
  acceptButton.addEventListener('click', function () { mode = 'accept'; render(); });
  pubButton.addEventListener('click', function () { mode = 'pub'; render(); });
  document.querySelector('.publication-filters').hidden = false;
  document.querySelector('.sort-row').hidden = false;
  render();
  if (root.location.hash) {
    try {
      var target = document.getElementById(decodeURIComponent(root.location.hash.slice(1)));
      if (target) target.scrollIntoView();
    } catch (_) { /* Ignore malformed fragment identifiers. */ }
  }
})(typeof window !== 'undefined' ? window : globalThis);
