#!/usr/bin/env node
/* Pemeriksaan hasil build (_site/). Jalankan setelah `node tools/build.mjs`:
     node tools/check.mjs
   Memeriksa: teks ada di HTML mentah (tanpa JS), semua link internal dan #anchor ada,
   JSON-LD valid, title/description unik dengan panjang wajar, satu H1 per halaman,
   canonical dan hreflang saling menunjuk, serta sitemap.xml. Keluar dengan kode 1 kalau ada masalah. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../content/site.mjs';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_site');
const SITE_URL = (process.env.SITE_URL || SITE.url).replace(/\/?$/, '/');
const problems = [];
const bad = (page, msg) => problems.push(`${page || '/'}: ${msg}`);

// semua halaman: path relatif ("" untuk beranda, "project/x/" dst.)
const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'index.html') pages.push(path.relative(OUT, path.dirname(p)).split(path.sep).filter(Boolean).map(s => s + '/').join(''));
  }
})(OUT);
const html = {}; for (const p of pages) html[p] = fs.readFileSync(path.join(OUT, p, 'index.html'), 'utf8');
// isi <script> (kode contoh, JSON-LD, JS) dibuang dulu supaya teks di dalamnya tidak dianggap link atau teks halaman
const noScripts = s => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const ids = {}; for (const p of pages) ids[p] = new Set([...noScripts(html[p]).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const titles = {}, descs = {};
let links = 0, ldCount = 0;
const LD_REQUIRED = {
  WebApplication: ['name', 'url', 'description', 'applicationCategory', 'operatingSystem', 'offers'],
  LearningResource: ['name', 'description', 'url', 'inLanguage', 'learningResourceType'],
  Article: ['headline', 'description', 'url', 'image', 'datePublished', 'author'],
  BreadcrumbList: ['itemListElement'], ItemList: ['itemListElement'],
};

for (const p of pages) {
  const h = html[p], body = noScripts(h);
  // 1) teks ada di HTML mentah
  const text = body.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 1500) bad(p, `teks di HTML mentah terlalu sedikit (${text.length} karakter)`);
  // 2) satu H1
  const h1 = [...body.matchAll(/<h1[\s>][\s\S]*?<\/h1>/gi)];
  if (h1.length !== 1) bad(p, `jumlah H1 = ${h1.length}`);
  // 3) title & description
  const title = decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode(attr((h.match(/<meta name="description"[^>]*>/) || [''])[0], 'content') || '');
  if (!title || title.length > 62) bad(p, `title ${title.length} karakter: "${title}"`);
  if (desc.length < 110 || desc.length > 165) bad(p, `description ${desc.length} karakter`);
  if (titles[title]) bad(p, `title sama dengan ${titles[title] || '/'}`); titles[title] = p;
  if (descs[desc]) bad(p, `description sama dengan ${descs[desc] || '/'}`); descs[desc] = p;
  // 4) canonical, hreflang, og
  const canon = attr((h.match(/<link rel="canonical"[^>]*>/) || [''])[0], 'href');
  if (canon !== SITE_URL + p) bad(p, `canonical salah: ${canon}`);
  for (const k of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) if (!h.includes(`"${k}"`)) bad(p, `tidak ada ${k}`);
  const alts = {}; for (const m of h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)) alts[m[1]] = m[2];
  for (const k of ['id', 'en', 'x-default']) if (!alts[k]) bad(p, `hreflang ${k} tidak ada`);
  for (const k of ['id', 'en']) {
    const target = (alts[k] || '').replace(SITE_URL, '');
    if (!html[target]) { bad(p, `hreflang ${k} menunjuk halaman yang tidak ada: ${alts[k]}`); continue; }
    if (!html[target].includes(`hreflang="${p.startsWith('en/') ? 'en' : 'id'}" href="${SITE_URL + p}"`)) bad(p, `hreflang ${k} tidak menunjuk balik`);
  }
  // 5) JSON-LD
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldCount++;
    let o; try { o = JSON.parse(m[1]); } catch (e) { bad(p, `JSON-LD tidak valid: ${e.message}`); continue; }
    if (o['@context'] !== 'https://schema.org') bad(p, 'JSON-LD tanpa @context schema.org');
    const req = LD_REQUIRED[o['@type']]; if (!req) { bad(p, `JSON-LD @type tidak dikenal: ${o['@type']}`); continue; }
    for (const k of req) if (o[k] == null || (Array.isArray(o[k]) && !o[k].length)) bad(p, `JSON-LD ${o['@type']} tanpa ${k}`);
    for (const it of (o.itemListElement || [])) { const u = it.item || it.url; if (!html[(u || '').replace(SITE_URL, '')]) bad(p, `JSON-LD menunjuk halaman yang tidak ada: ${u}`); }
  }
  if (!/application\/ld\+json/.test(h)) bad(p, 'tidak ada JSON-LD');
  // 6) semua link internal (href/src) ada, termasuk #anchor
  for (const m of body.matchAll(/<(a|link|script|img|source)\b[^>]*>/gi)) {
    const ref = attr(m[0], 'href') ?? attr(m[0], 'src');
    if (!ref || /^(https?:|mailto:|data:|javascript:)/i.test(ref)) continue;
    links++;
    const [u, hash] = decode(ref).split('#');
    let target = p;
    if (u) {
      const resolved = new URL(u, 'http://x/' + p).pathname.slice(1).replace(/\?.*$/, '');
      if (resolved === '' || resolved.endsWith('/')) {
        if (!html[resolved]) { bad(p, `link ke halaman yang tidak ada: ${ref}`); continue; }
        target = resolved;
      } else {
        if (!fs.existsSync(path.join(OUT, resolved))) bad(p, `file tidak ada: ${ref}`);
        continue;
      }
    }
    // #simulator/... ditangani JavaScript, bukan elemen di halaman
    if (hash && !hash.startsWith('simulator') && !ids[target].has(hash)) bad(p, `#${hash} tidak ada di ${target || '/'}`);
  }
}

// 7) sitemap & robots
const sm = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE_URL, ''));
for (const l of locs) if (!html[l]) bad('sitemap.xml', `URL tidak ada: ${l}`);
for (const p of pages) if (!locs.includes(p)) bad('sitemap.xml', `halaman tidak tercantum: ${p || '/'}`);
if (!fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf8').includes(`Sitemap: ${SITE_URL}sitemap.xml`)) bad('robots.txt', 'tidak menunjuk sitemap');

console.log(`${pages.length} halaman, ${links} link internal, ${ldCount} blok JSON-LD, ${locs.length} URL di sitemap`);
if (problems.length) { console.log(`\n${problems.length} masalah:`); problems.forEach(x => console.log(' - ' + x)); process.exit(1); }
console.log('semua pemeriksaan lolos');
