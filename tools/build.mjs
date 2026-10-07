#!/usr/bin/env node
/* Build situs statis ke folder _site/ untuk GitHub Pages.
   - Beranda (/ dan /en/) di-prerender: isi lang/<bahasa>/main.html ditulis langsung ke #app-root,
     supaya mesin pencari bisa membaca teksnya tanpa menjalankan JavaScript.
   - Halaman panduan per project, per pelajaran, daftar, dan artikel jebakan ESP32 (ID dan EN).
   - Meta tag SEO, JSON-LD, sitemap.xml, robots.txt.
   Data project dan pelajaran dibaca langsung dari js/main.js dan js/sim.js, kode dari examples/,
   teks tambahan dari content/. Tanpa dependency: cukup `node tools/build.mjs`.
   Variabel lingkungan: GITHUB_SHA (versi file, otomatis di GitHub Actions), SITE_URL (opsional). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { SITE, HOME, UI } from '../content/site.mjs';
import { PROJECT_TEXT } from '../content/projects.mjs';
import { LESSON_TEXT } from '../content/lessons.mjs';
import { PITFALLS } from '../content/pitfalls.mjs';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(SRC, '_site');
const VERSION = (process.env.GITHUB_SHA || '').slice(0, 7) || 'dev';
const SITE_URL = (process.env.SITE_URL || SITE.url).replace(/\/?$/, '/');
const TODAY = new Date().toISOString().slice(0, 10);
const LANGS = ['id', 'en'];
const OG_LOCALE = { id: 'id_ID', en: 'en_US' };

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
// nilai dari _L(...) di kode sumber menjadi {id, en}; teks biasa dipakai apa adanya
const T = (v, l) => (v && typeof v === 'object' && 'id' in v ? v[l] : v);
const fail = msg => { throw new Error(msg); };

/* ---------------- data dari kode sumber ---------------- */
const mainJs = read('js/main.js'), simJs = read('js/sim.js'), indexSrc = read('index.html');

// jalankan potongan kode sumber (start sampai end) di sandbox; withEnd: ikutkan teks end-nya
function evalSlice(src, start, end, name, withEnd = false) {
  const a = src.indexOf(start); if (a < 0) fail(`tidak ketemu: ${start}`);
  let b = src.indexOf(end, a); if (b < 0) fail(`tidak ketemu: ${end}`);
  if (withEnd) b += end.length;
  const ctx = { _L: (id, en) => ({ id, en }) };
  vm.createContext(ctx);
  vm.runInContext(`${src.slice(a, b)}\n;globalThis.__R=${name};`, ctx);
  return ctx.__R;
}
const PROJECTS = evalSlice(mainJs, "const K='#26292d'", 'PROJECTS.forEach', 'PROJECTS');
PROJECTS.forEach((p, i) => { p.n = i + 1; });
const SIM_OF = evalSlice(mainJs, 'const SIM_OF=', '\n', 'SIM_OF');
const lessonsStart = simJs.indexOf('const LESSONS=[');
const lessonsEnd = simJs.indexOf('\n  ];', lessonsStart) + 5;
const LESSONS = evalSlice(simJs, 'const LESSONS=[', '\n  ];', 'LESSONS', true);

// kode contoh simulator: entri ['kunci',_L(...),()=>...] berisi _L(String.raw`kode id`,String.raw`kode en`)
const RAW_PAIR = /_L\(String\.raw`([\s\S]*?)`,\s*String\.raw`([\s\S]*?)`\)/;
function simExampleCode(key) {
  const a = simJs.indexOf(`['${key}',_L(`); if (a < 0) fail(`contoh simulator tidak ada: ${key}`);
  const b = simJs.indexOf("\n  ['", a + 5);
  const m = simJs.slice(a, b < 0 ? undefined : b).match(RAW_PAIR);
  return m ? { id: m[1], en: m[2] } : null;
}
// kode jawaban tiap pelajaran: exOf('kunci') atau kode yang ditulis langsung di answer
function lessonCode(id) {
  const region = simJs.slice(lessonsStart, lessonsEnd);
  const a = region.indexOf(`{id:'${id}',t:`); if (a < 0) fail(`pelajaran tidak ada: ${id}`);
  const b = region.indexOf("{id:'", a + 5);
  const ans = region.slice(a, b < 0 ? undefined : b).split('answer:')[1] || '';
  const ex = ans.match(/exOf\('(\w+)'\)/);
  if (ex) return simExampleCode(ex[1]);
  const m = ans.match(RAW_PAIR);
  return m ? { id: m[1], en: m[2] } : null;
}
const inoCode = (l, id) => read(`examples/${l}/${id}.ino`);
const GOAT = (indexSrc.match(/goatcounter:'([^']*)'/) || [])[1] || '';
const ICON = (indexSrc.match(/<link rel="icon"[^>]*>/) || [''])[0];

// pemeriksaan awal: setiap project dan pelajaran punya teks tambahan
for (const p of PROJECTS) if (!PROJECT_TEXT[p.id]) fail(`content/projects.mjs belum punya ${p.id}`);
for (const L of LESSONS) if (!LESSON_TEXT[L.id]) fail(`content/lessons.mjs belum punya ${L.id}`);

/* ---------------- alamat halaman ---------------- */
// semua alamat relatif terhadap folder utama situs dan berakhiran / (folder berisi index.html)
const P = {
  home: l => (l === 'en' ? 'en/' : ''),
  projects: l => (l === 'en' ? 'en/project/' : 'project/'),
  project: (l, id) => `${P.projects(l)}${T(PROJECTS.find(p => p.id === id).slug, l)}/`,
  lessons: l => (l === 'en' ? 'en/learn/' : 'belajar/'),
  lesson: (l, id) => `${P.lessons(l)}${LESSON_TEXT[id].slug[l]}/`,
  pitfalls: l => (l === 'en' ? `en/${PITFALLS.en.slug}/` : `${PITFALLS.id.slug}/`),
};
const abs = p => SITE_URL + p;
const depth = p => (p.match(/\//g) || []).length;
const up = p => '../'.repeat(depth(p));
// link relatif dari halaman `from` ke halaman `to`
const rel = (from, to) => up(from) + to || './';

/* ---------------- potongan HTML bersama ---------------- */
const withBrand = t => (t.length + 12 <= 60 ? `${t} | ${SITE.name}` : t);
const jsonld = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function seoHead(pg) {
  const l = pg.lang, img = abs(SITE.ogImage), alt = HOME[l].ogAlt;
  return [
    `<title>${esc(pg.fullTitle)}</title>`,
    `<meta name="description" content="${esc(pg.desc)}">`,
    `<link rel="canonical" href="${abs(pg.path)}">`,
    `<link rel="alternate" hreflang="id" href="${abs(pg.alt.id)}">`,
    `<link rel="alternate" hreflang="en" href="${abs(pg.alt.en)}">`,
    `<link rel="alternate" hreflang="x-default" href="${abs(pg.alt.id)}">`,
    `<meta property="og:type" content="${pg.ogType || 'website'}">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:locale" content="${OG_LOCALE[l]}">`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[l === 'en' ? 'id' : 'en']}">`,
    `<meta property="og:title" content="${esc(pg.title)}">`,
    `<meta property="og:description" content="${esc(pg.desc)}">`,
    `<meta property="og:url" content="${abs(pg.path)}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:width" content="${SITE.ogImageW}">`,
    `<meta property="og:image:height" content="${SITE.ogImageH}">`,
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(pg.title)}">`,
    `<meta name="twitter:description" content="${esc(pg.desc)}">`,
    `<meta name="twitter:image" content="${img}">`,
    `<meta name="twitter:image:alt" content="${esc(alt)}">`,
    ...pg.ld.map(jsonld),
  ].join('\n');
}

function breadcrumbLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })) };
}
function crumbsHtml(pg, items) {
  return `<nav class="crumbs" aria-label="${UI[pg.lang].crumbs}"><ol>${items.map((it, i) => i === items.length - 1
    ? `<li aria-current="page">${esc(it.name)}</li>`
    : `<li><a href="${rel(pg.path, it.path)}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
}

const BRAND_SVG = '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="6" y="6" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10" y="10" width="6" height="6" fill="var(--accent)"/><path d="M9 2v4M13 2v4M17 2v4M9 20v4M13 20v4M17 20v4M2 9h4M2 13h4M2 17h4M20 9h4M20 13h4M20 17h4" stroke="currentColor" stroke-width="2"/></svg>';
const MOON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="currentColor"/></svg>';
const FONTS = 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap';

// halaman statis (project, pelajaran, daftar, artikel): ringan, tanpa three.js dan tanpa js/app.js
function shell(pg, body) {
  const l = pg.lang, u = UI[l], up_ = up(pg.path), home = rel(pg.path, P.home(l));
  const langLink = x => `<a href="${rel(pg.path, pg.alt[x])}" hreflang="${x}" lang="${x}"${x === l ? ' aria-current="page"' : ''}>${x.toUpperCase()}</a>`;
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
${seoHead(pg)}
${ICON}
<script>try{var t=JSON.parse(localStorage.getItem('esp32lab-theme'));if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${FONTS}"></noscript>
<link rel="stylesheet" href="${up_}css/main.css?v=${VERSION}">
<link rel="stylesheet" href="${up_}css/page.css?v=${VERSION}">
</head>
<body class="doc-page">
<nav class="top" aria-label="${u.menu}">
  <div class="wrap nav-in">
    <a class="brand" href="${home}">${BRAND_SVG} ESP32 Lab</a>
    <div class="nav-links">
      <a href="${home}#pinout">${u.pinout}</a>
      <a href="${rel(pg.path, P.projects(l))}">${u.projects}</a>
      <a href="${rel(pg.path, P.lessons(l))}">${u.lessons}</a>
      <a href="${rel(pg.path, P.pitfalls(l))}">${u.pitfalls}</a>
      <a href="${home}#simulator" class="nav-sim">${u.simulator}</a>
    </div>
    <div class="lang-sw" role="group" aria-label="Bahasa / Language">${langLink('id')}${langLink('en')}</div>
    <button class="icon-btn" id="themeBtn" type="button" aria-label="${u.theme}">${MOON_SVG}</button>
  </div>
</nav>
<main class="doc">
${body}
</main>
<footer><div class="wrap">${esc(u.footer)} <a href="${home}#saran">${u.feedback}</a> · <a href="${SITE.repo}">${u.source}</a></div></footer>
<script>
(function(){
  var d=document.documentElement,b=document.getElementById('themeBtn');
  b.addEventListener('click',function(){var a=d.getAttribute('data-theme'),dark=a?a==='dark':matchMedia('(prefers-color-scheme: dark)').matches,n=dark?'light':'dark';d.setAttribute('data-theme',n);try{localStorage.setItem('esp32lab-theme',JSON.stringify(n))}catch(e){}});
  Array.prototype.forEach.call(document.querySelectorAll('.copy'),function(btn){btn.addEventListener('click',function(){
    var c=btn.parentNode.querySelector('code').textContent,o=btn.textContent;
    if(navigator.clipboard)navigator.clipboard.writeText(c).then(function(){btn.textContent=btn.getAttribute('data-ok');setTimeout(function(){btn.textContent=o},1500)});});});
  // pilihan bahasa diingat untuk kunjungan berikutnya
  Array.prototype.forEach.call(document.querySelectorAll('.lang-sw a'),function(a){a.addEventListener('click',function(){try{localStorage.setItem('esp32lab-lang',a.getAttribute('hreflang'))}catch(e){}});});
})();
</script>
${GOAT ? `<script data-goatcounter="https://${GOAT}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>` : ''}
</body>
</html>
`;
}

const codeBlock = (code, l) => `<div class="code-wrap"><button class="btn ghost sm copy" type="button" data-ok="${UI[l].copied}">${UI[l].copy}</button><pre><code>${esc(code.replace(/\s+$/, ''))}</code></pre></div>`;
const wiringTable = (rows, l) => `<div class="tbl"><table><thead><tr><th>${UI[l].from}</th><th>${UI[l].to}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(T(r[0], l))}</td><td>${esc(T(r[1], l))}</td></tr>`).join('')}</tbody></table></div>`;
const faq = list => `<dl class="faq">${list.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>`;
const projectCard = (from, l, p) => `<li><a href="${rel(from, P.project(l, p.id))}"><span class="k">${UI[l].projectN(p.n)} · ${esc(T(p.cat, l))}</span><b>${esc(T(p.title, l))}</b><small>${esc(T(p.desc, l))}</small></a></li>`;
const pager = (from, l, prev, next) => (prev || next) ? `<nav class="pager">${prev ? `<a class="prev" href="${rel(from, prev.path)}"><small>← ${UI[l].prev}</small>${esc(prev.name)}</a>` : '<span></span>'}${next ? `<a class="next" href="${rel(from, next.path)}"><small>${UI[l].next} →</small>${esc(next.name)}</a>` : ''}</nav>` : '';

/* ---------------- daftar halaman ---------------- */
const pages = [];
const alts = fn => ({ id: fn('id'), en: fn('en') });

// beranda
for (const l of LANGS) pages.push({ kind: 'home', lang: l, path: P.home(l), alt: alts(P.home), title: HOME[l].title, desc: HOME[l].desc });

// daftar project dan pelajaran
for (const l of LANGS) {
  pages.push({ kind: 'projects', lang: l, path: P.projects(l), alt: alts(P.projects), title: UI[l].projectsTitle, desc: UI[l].projectsDesc });
  pages.push({ kind: 'lessons', lang: l, path: P.lessons(l), alt: alts(P.lessons), title: UI[l].lessonsTitle, desc: UI[l].lessonsDesc });
}
// project
for (const p of PROJECTS) for (const l of LANGS) {
  const t = PROJECT_TEXT[p.id][l];
  pages.push({ kind: 'project', lang: l, id: p.id, path: P.project(l, p.id), alt: alts(x => P.project(x, p.id)), title: t.title, desc: t.desc });
}
// pelajaran
for (const L of LESSONS) for (const l of LANGS) {
  const t = LESSON_TEXT[L.id][l];
  pages.push({ kind: 'lesson', lang: l, id: L.id, path: P.lesson(l, L.id), alt: alts(x => P.lesson(x, L.id)), title: t.title, desc: t.desc });
}
// artikel
for (const l of LANGS) pages.push({ kind: 'pitfalls', lang: l, path: P.pitfalls(l), alt: alts(P.pitfalls), title: PITFALLS[l].title, desc: PITFALLS[l].desc, ogType: 'article' });

for (const pg of pages) pg.fullTitle = pg.kind === 'home' ? pg.title : withBrand(pg.title);

/* ---------------- isi tiap jenis halaman ---------------- */
const homeCrumb = l => ({ name: SITE.name, path: P.home(l) });
const resourceLd = (pg, h1, type) => ({ '@context': 'https://schema.org', '@type': 'LearningResource', name: h1, description: pg.desc,
  url: abs(pg.path), inLanguage: pg.lang, learningResourceType: type, educationalLevel: pg.lang === 'en' ? 'Beginner' : 'Pemula',
  isAccessibleForFree: true, image: abs(SITE.ogImage), isPartOf: { '@type': 'WebSite', name: SITE.name, url: abs(P.home(pg.lang)) } });

function fillLinks(html, pg) {
  const l = pg.lang, home = rel(pg.path, P.home(l));
  return html
    .replace(/\{\{project:(\w+)\}\}/g, (_, id) => { const p = PROJECTS.find(x => x.id === id) || fail(`project tidak ada: ${id}`); return `<a href="${rel(pg.path, P.project(l, id))}">${esc(T(p.title, l))}</a>`; })
    .replace(/\{\{home:pinout\}\}/g, `<a href="${home}#pinout">${UI[l].pinout}</a>`)
    .replace(/\{\{home:saran\}\}/g, `<a href="${home}#saran">${PITFALLS[l].outroLink}</a>`);
}

function renderProject(pg) {
  const l = pg.lang, u = UI[l], p = PROJECTS.find(x => x.id === pg.id), t = PROJECT_TEXT[p.id][l], ex = PROJECT_TEXT[p.id];
  const home = rel(pg.path, P.home(l)), i = PROJECTS.indexOf(p);
  const crumbs = [homeCrumb(l), { name: u.projects, path: P.projects(l) }, { name: T(p.title, l), path: pg.path }];
  pg.ld = [resourceLd(pg, t.h1, 'Tutorial'), breadcrumbLd(crumbs)];
  const nb = q => q && { path: P.project(l, q.id), name: T(q.title, l) };
  const cta = SIM_OF[p.id]
    ? `<a class="btn accent lg" href="${home}#simulator/project/${p.id}">${u.trySim}</a><a class="btn ghost lg" href="#kode">${u.seeCode}</a>`
    : `<a class="btn ghost lg" href="#kode">${u.seeCode}</a><p class="note warn">${u.noSim}</p>`;
  return `${crumbsHtml(pg, crumbs)}
<article>
<header>
<div class="eyebrow">${u.projectN(p.n)} · ${esc(T(p.cat, l))}</div>
<h1>${esc(t.h1)}</h1>
<p class="lede">${t.intro}</p>
<div class="doc-cta">${cta}</div>
</header>
<section><h2>${u.youNeed}</h2><ul>${p.parts.map(x => `<li>${esc(T(x, l))}</li>`).join('')}</ul>
${p.libs.length ? `<h3>${u.libs}</h3><ul>${p.libs.map(x => `<li>${esc(T(x, l))}</li>`).join('')}</ul><p class="muted">${u.libsHow}</p>` : ''}</section>
<section><h2>${u.wiring}</h2>${wiringTable(p.wiring, l)}<p class="note">${esc(T(p.note, l))}</p></section>
<section id="kode"><h2>${u.code}</h2>${codeBlock(inoCode(l, p.id), l)}<p class="muted">${u.board}</p></section>
<section><h2>${u.how}</h2>${t.how.map(x => `<p>${x}</p>`).join('')}</section>
<section><h2>${u.problems}</h2>${faq(t.problems)}${ex.pitfall ? `<p class="more-link"><a href="${rel(pg.path, P.pitfalls(l))}#${ex.pitfall}">${u.readPitfalls} →</a></p>` : ''}</section>
<section><h2>${u.related}</h2><ul class="cards">${ex.related.map(id => projectCard(pg.path, l, PROJECTS.find(x => x.id === id))).join('')}</ul></section>
</article>
${pager(pg.path, l, nb(PROJECTS[i - 1]), nb(PROJECTS[i + 1]))}`;
}

function renderLesson(pg) {
  const l = pg.lang, u = UI[l], L = LESSONS.find(x => x.id === pg.id), t = LESSON_TEXT[L.id][l], ex = LESSON_TEXT[L.id];
  const home = rel(pg.path, P.home(l)), i = LESSONS.indexOf(L), proj = PROJECTS.find(x => x.id === ex.project);
  const crumbs = [homeCrumb(l), { name: u.lessons, path: P.lessons(l) }, { name: T(L.t, l), path: pg.path }];
  pg.ld = [resourceLd(pg, t.h1, 'Lesson'), breadcrumbLd(crumbs)];
  const parts = t.parts || proj.parts.map(x => T(x, l));
  const wiring = t.wiring || proj.wiring;
  const code = lessonCode(L.id);
  const nb = q => q && { path: P.lesson(l, q.id), name: T(q.t, l) };
  return `${crumbsHtml(pg, crumbs)}
<article>
<header>
<div class="eyebrow">${u.lessonOf(i + 1, LESSONS.length)}</div>
<h1>${esc(t.h1)}</h1>
<p class="lede">${t.intro}</p>
<div class="doc-cta"><a class="btn accent lg" href="${home}#simulator/belajar/${L.id}">${u.startLesson}</a></div>
</header>
<section><h2>${u.goal}</h2><p>${esc(T(L.goal, l))}</p><p class="note">${esc(T(L.rule, l))}</p></section>
<section><h2>${u.youNeed}</h2><ul>${parts.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
<section><h2>${u.wiring}</h2>${wiringTable(wiring, l)}</section>
<section><h2>${u.steps}</h2><ol>${L.steps.map(s => `<li>${esc(T(s.t, l))}</li>`).join('')}</ol><p><b>${u.hint}:</b> ${esc(T(L.hint, l))}</p></section>
${code ? `<section id="kode"><h2>${u.code}</h2>${codeBlock(code[l], l)}<p class="muted">${u.board}</p></section>` : ''}
<section><h2>${u.problems}</h2>${faq(t.problems)}</section>
<section><h2>${u.relatedProject}</h2><ul class="cards">${projectCard(pg.path, l, proj)}</ul></section>
</article>
${pager(pg.path, l, nb(LESSONS[i - 1]), nb(LESSONS[i + 1]))}`;
}

function renderList(pg) {
  const l = pg.lang, u = UI[l], isP = pg.kind === 'projects';
  const crumbs = [homeCrumb(l), { name: isP ? u.projects : u.lessons, path: pg.path }];
  const items = isP ? PROJECTS.map(p => ({ path: P.project(l, p.id), name: T(p.title, l) })) : LESSONS.map(L => ({ path: P.lesson(l, L.id), name: T(L.t, l) }));
  pg.ld = [{ '@context': 'https://schema.org', '@type': 'ItemList', name: isP ? u.projectsH1 : u.lessonsH1,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(it.path), name: it.name })) }, breadcrumbLd(crumbs)];
  const cards = isP ? PROJECTS.map(p => projectCard(pg.path, l, p)).join('')
    : LESSONS.map((L, i) => `<li><a href="${rel(pg.path, P.lesson(l, L.id))}"><span class="k">${u.lessonOf(i + 1, LESSONS.length)}</span><b>${esc(T(L.t, l))}</b><small>${esc(LESSON_TEXT[L.id][l].desc)}</small></a></li>`).join('');
  return `${crumbsHtml(pg, crumbs)}
<header><h1>${esc(isP ? u.projectsH1 : u.lessonsH1)}</h1><p class="lede">${esc(isP ? u.projectsLede : u.lessonsLede)}</p></header>
<section><ul class="cards">${cards}</ul></section>`;
}

function renderPitfalls(pg) {
  const l = pg.lang, u = UI[l], A = PITFALLS[l];
  const crumbs = [homeCrumb(l), { name: u.pitfalls, path: pg.path }];
  pg.ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: A.h1, description: A.desc, inLanguage: l,
    url: abs(pg.path), mainEntityOfPage: abs(pg.path), image: abs(SITE.ogImage), datePublished: PITFALLS.published, dateModified: TODAY,
    author: { '@type': 'Organization', name: SITE.name, url: abs(P.home(l)) }, publisher: { '@type': 'Organization', name: SITE.name, url: abs(P.home(l)) } },
    breadcrumbLd(crumbs)];
  return `${crumbsHtml(pg, crumbs)}
<article>
<header><h1>${esc(A.h1)}</h1><p class="lede">${A.intro}</p></header>
<nav class="toc" aria-label="${A.toc}"><b>${A.toc}</b><ol>${A.sections.map(s => `<li><a href="#${s.id}">${esc(s.h2.replace(/^\d+\.\s*/, ''))}</a></li>`).join('')}</ol></nav>
${A.sections.map(s => `<section id="${s.id}"><h2>${s.h2}</h2>${fillLinks(s.html, pg)}</section>`).join('\n')}
<section><p>${fillLinks(A.outro, pg)}</p></section>
</article>`;
}

// beranda: index.html sumber + isi bahasa ditulis langsung ke #app-root
function renderHome(pg) {
  const l = pg.lang, up_ = up(pg.path);
  pg.ld = [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE.name, url: abs(pg.path), description: pg.desc,
    inLanguage: l, applicationCategory: 'EducationalApplication', operatingSystem: 'Web browser', browserRequirements: 'Requires JavaScript and WebGL',
    isAccessibleForFree: true, image: abs(SITE.ogImage), offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' } }];
  // link ke halaman lain di lang/*.html ditulis relatif terhadap folder utama; sesuaikan untuk /en/
  const fixHref = html => html.replace(/href="(?![#a-z]+:|#|\/)([^"]*)"/gi, (m, h) => `href="${up_}${h}"`);
  const content = read(`lang/${l}/main.html`);
  const codes = PROJECTS.map(p => {
    const c = inoCode(l, p.id);
    if (/<\/script/i.test(c)) fail(`examples/${l}/${p.id}.ino berisi </script`);
    return `<script type="text/plain" id="code-${p.id}">\n${c}</script>`;
  }).join('');
  let html = indexSrc;
  // pengganti berupa fungsi supaya tanda $ di isi halaman tidak dianggap pola khusus oleh replace()
  const swap = (re, to) => { if (!re.test(html)) fail(`index.html: pola tidak ketemu ${re}`); html = html.replace(re, typeof to === 'function' ? to : () => to); };
  swap(/<html lang="[^"]*">/, `<html lang="${l}" data-title-id="${esc(HOME.id.title)}" data-title-en="${esc(HOME.en.title)}">`);
  swap(/<title>[^<]*<\/title>\n/, '');
  swap(/<meta name="description"[^>]*>\n/, '');
  swap(/<meta property="og:title"[^>]*>\n/, '');
  swap(/(<meta name="viewport"[^>]*>\n)/, (m, v) => `${v}${seoHead(pg)}\n`);
  swap(/<!-- Isi halaman[^>]*-->\n/, '');
  swap(/<div id="app-root"><\/div>/, `<div id="app-root" data-prerender="${l}">${fixHref(content)}${codes}</div>`);
  html = html.replace(/(href|src)="(css|js)\//g, `$1="${up_}$2/`).replace(/\?v=dev/g, `?v=${VERSION}`);
  return html;
}

/* ---------------- tulis hasil ---------------- */
fs.rmSync(OUT, { recursive: true, force: true });
const SKIP = new Set(['.git', '.github', '_site', 'tools', 'content', 'node_modules', 'README.md', '.gitignore', '.DS_Store', 'index.html']);
for (const f of fs.readdirSync(SRC)) if (!SKIP.has(f)) fs.cpSync(path.join(SRC, f), path.join(OUT, f), { recursive: true, filter: s => !s.endsWith('.DS_Store') });
// versi file juga untuk css/js yang dimuat halaman statis
const write = (p, s) => { const f = path.join(OUT, p, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

for (const pg of pages) {
  if (pg.kind === 'home') { write(pg.path, renderHome(pg)); continue; }
  const body = { project: renderProject, lesson: renderLesson, projects: renderList, lessons: renderList, pitfalls: renderPitfalls }[pg.kind](pg);
  write(pg.path, shell(pg, body));
}

// sitemap.xml dan robots.txt
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(pg => `<url><loc>${abs(pg.path)}</loc><lastmod>${TODAY}</lastmod>${LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${abs(pg.alt[x])}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${abs(pg.alt.id)}"/></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('sitemap.xml')}\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`build selesai: ${pages.length} halaman ke ${path.relative(SRC, OUT)}/ (versi ${VERSION}, ${SITE_URL})`);
