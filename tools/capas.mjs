// Gera as capas do blog no estilo Studio: node tools/capas.mjs
// Precisa do Playwright (npm i -D playwright). Cada capa sai em images/blog/<slug>.jpg, 1600 x 900.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const posts = JSON.parse(readFileSync(join(root, 'tools/capas.json'), 'utf8'));
const tokens = readFileSync(join(root, 'css/tokens.css'), 'utf8');

const page = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&family=Geist:wght@400;500&display=swap" rel="stylesheet">
<style>${tokens}
html, body { margin: 0; }
.cover { position: relative; width: 1600px; height: 900px; box-sizing: border-box; padding: 72px 96px; display: grid; grid-template-rows: auto 1fr auto; background: var(--color-paper);
  background-image: radial-gradient(circle at 1px 1px, var(--color-dot) 1.2px, transparent 1.6px); background-size: 32px 32px; color: var(--color-ink); font-family: var(--font-body); overflow: hidden; }
.read { display: flex; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--color-ink-2); font: 500 22px/1 var(--font-body); color: var(--color-muted); }
.sheet { position: relative; align-self: center; }
.mark { position: absolute; right: 96px; top: 50%; transform: translateY(-46%); font: 400 300px/1 var(--font-display); letter-spacing: -0.04em; color: color-mix(in oklab, var(--color-ink) 9%, transparent); white-space: nowrap; }
.mark::after { content: ''; position: absolute; left: 0; right: 0; top: 0.9em; height: 2px; background: var(--color-accent); }
.kicker { font: 500 26px/1 var(--font-body); color: var(--color-ink-2); margin-bottom: 36px; }
/* Linhas de base reais da Hedvig: com line-height 1.1, a base fica a 0.9em do topo de cada linha */
h1 { margin: 0; max-width: 15ch; font: 400 ${'${size}'}px/1.1 var(--font-display); letter-spacing: -0.025em;
  background-image: linear-gradient(to bottom, transparent calc(0.9em - 1px), var(--color-accent) calc(0.9em - 1px), var(--color-accent) 0.9em, transparent 0.9em);
  background-size: 100% 1.1em; }
.foot { display: flex; justify-content: space-between; align-items: end; font: 500 22px/1 var(--font-body); color: var(--color-muted); }
.foot b { font: 400 34px/1 var(--font-display); color: var(--color-ink); }
.crop { position: absolute; inset: 40px; pointer-events: none;
  --m: var(--color-mark); --l: 18px; --o: 22px;
  background:
    linear-gradient(var(--m), var(--m)) 0 var(--o) / var(--l) 1px no-repeat, linear-gradient(var(--m), var(--m)) var(--o) 0 / 1px var(--l) no-repeat,
    linear-gradient(var(--m), var(--m)) 100% var(--o) / var(--l) 1px no-repeat, linear-gradient(var(--m), var(--m)) calc(100% - var(--o)) 0 / 1px var(--l) no-repeat,
    linear-gradient(var(--m), var(--m)) 0 calc(100% - var(--o)) / var(--l) 1px no-repeat, linear-gradient(var(--m), var(--m)) var(--o) 100% / 1px var(--l) no-repeat,
    linear-gradient(var(--m), var(--m)) 100% calc(100% - var(--o)) / var(--l) 1px no-repeat, linear-gradient(var(--m), var(--m)) calc(100% - var(--o)) 100% / 1px var(--l) no-repeat; }
</style></head><body>
<div class="cover"><i class="crop"></i>${p.mark ? `<span class="mark">${p.mark}</span>` : ''}
  <div class="read"><span>Blog</span><span>${p.date}</span></div>
  <div class="sheet"><div class="kicker">${p.kicker}</div><h1>${p.title}</h1></div>
  <div class="foot"><b>Rafael Zigart</b><span>zigart.com</span></div>
</div></body></html>`.replace('${size}', String(p.size || 104));

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const p of posts) {
  await tab.setContent(page(p), { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(root, 'images/blog', p.slug + '.jpg'), type: 'jpeg', quality: 86 });
  console.log('images/blog/' + p.slug + '.jpg');
}
await browser.close();
