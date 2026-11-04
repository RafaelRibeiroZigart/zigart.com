// Gera as capas do blog e de compartilhamento: node tools/capas.mjs
// Precisa do Playwright (npm i -D playwright). Cada capa sai em images/blog/<slug>.jpg, 1600 x 900.
// O cenário em pixel (céu, nuvens e camadas de prédios) é sorteado a partir do slug, então cada capa é única e sempre igual.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const posts = JSON.parse(readFileSync(join(root, 'tools/capas.json'), 'utf8'));
const tokens = readFileSync(join(root, 'css/tokens.css'), 'utf8');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const page = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&family=Geist:wght@400;500&display=swap" rel="stylesheet">
<style>${tokens}
:root { --sky-top: oklch(55% 0.2 258); --sky-low: oklch(80% 0.09 235); --p1: oklch(30% 0.14 266); --p2: oklch(42% 0.2 264); --p3: oklch(57% 0.24 262); --p4: oklch(73% 0.13 252); --p5: oklch(90% 0.05 240); --cloud: oklch(97% 0.01 230); }
html, body { margin: 0; }
.cover { position: relative; width: 1600px; height: 900px; overflow: hidden; font-family: var(--font-body); }
canvas { position: absolute; inset: 0; width: 1600px; height: 900px; }
.card { position: absolute; left: 50%; top: 92px; width: 1040px; height: 640px; box-sizing: border-box; padding: 56px 72px; margin-left: -520px;
  background: var(--color-paper-hi); border-radius: 36px; box-shadow: 0 24px 60px -20px oklch(20% 0.1 264 / 0.55), 0 2px 0 oklch(20% 0.1 264 / 0.08);
  transform: rotate(${p.tilt ?? -3}deg); display: grid; grid-template-rows: auto auto 1fr; gap: 28px; color: var(--color-ink); }
.read { display: flex; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid var(--color-ink-2); font: 500 22px/1 var(--font-body); color: var(--color-muted); }
.kicker { font: 500 26px/1.2 var(--font-body); color: var(--color-ink-2); }
h1 { margin: 0; align-self: start; max-width: 16ch; font: 400 ${p.size || 84}px/1.1 var(--font-display); letter-spacing: -0.025em;
  background-image: linear-gradient(to bottom, transparent calc(0.9em - 2px), var(--color-accent) calc(0.9em - 2px), var(--color-accent) 0.9em, transparent 0.9em); background-size: 100% 1.1em; }
.pic { position: absolute; right: 72px; bottom: 56px; border-radius: 14px; box-shadow: 0 10px 30px -12px oklch(20% 0.1 264 / 0.5); }
</style></head><body>
<div class="cover">
  <canvas id="back" width="1600" height="900"></canvas>
  <div class="card"><div class="read"><span>${esc(p.section || 'Blog')}, ${esc(p.date)}</span><span>Rafael Zigart</span></div><div class="kicker">${esc(p.kicker)}</div><h1>${esc(p.title)}</h1>${p.image ? `<img class="pic" src="data:image/${p.image.split('.').pop()};base64,${readFileSync(join(root, p.image)).toString('base64')}" style="width:${p.imageWidth || 320}px">` : ''}</div>
  <canvas id="front" width="1600" height="900"></canvas>
</div>
<script>
(() => {
const seedStr = ${JSON.stringify(p.slug)};
let h = 2166136261; for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const W = 1600, H = 900, S = 16;
const back = document.getElementById('back').getContext('2d'), front = document.getElementById('front').getContext('2d');
// Sky
const g = back.createLinearGradient(0, 0, 0, H); g.addColorStop(0, css('--sky-top')); g.addColorStop(0.75, css('--sky-low')); back.fillStyle = g; back.fillRect(0, 0, W, H);
// Pixel clouds: soft-edged blobs drawn as squares, the edge dithered
const cloud = (cx, cy, rw, rh) => {
  back.fillStyle = css('--cloud');
  for (let y = -rh; y <= rh; y += S) for (let x = -rw; x <= rw; x += S) {
    const d = (x * x) / (rw * rw) + (y * y) / (rh * rh) + (rnd() - 0.5) * 0.35;
    if (d < 0.75) { back.globalAlpha = 0.95; back.fillRect(Math.round((cx + x) / S) * S, Math.round((cy + y) / S) * S, S, S); }
    else if (d < 1) { back.globalAlpha = 0.45; back.fillRect(Math.round((cx + x) / S) * S, Math.round((cy + y) / S) * S, S, S); }
  }
  back.globalAlpha = 1;
};
for (let i = 0; i < 4; i++) { const side = i % 2 ? 0.86 : 0.12; cloud(W * (side + (rnd() - 0.5) * 0.12), 80 + rnd() * 380, 90 + rnd() * 120, 28 + rnd() * 34); }
// Skyline layers: back layers behind the card, the front layer over its foot
const layer = (ctx, base, amp, col, step, sparks) => {
  ctx.fillStyle = col; let y = base;
  for (let x = 0; x < W; x += step) {
    if (rnd() < 0.55) y = base - Math.round((rnd() * amp) / S) * S;
    ctx.fillRect(x, y, step, H - y);
    if (sparks) for (let k = 0; k < 2; k++) if (rnd() < sparks) { ctx.fillStyle = sparks > 0.3 ? css('--p5') : css('--p4'); ctx.fillRect(x + Math.round((rnd() * step) / S) * S, y + S * (2 + Math.round(rnd() * 8)), S, S); ctx.fillStyle = col; }
  }
};
layer(back, 640, 160, css('--p5'), S * 3, 0);
layer(back, 700, 130, css('--p4'), S * 2, 0.2);
layer(front, 760, 110, css('--p3'), S * 2, 0.35);
layer(front, 810, 80, css('--p2'), S * 3, 0.3);
layer(front, 860, 48, css('--p1'), S * 2, 0.25);
})();
</script></body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1600, height: 900 } });
tab.on('pageerror', (e) => console.error('page error', e.message));
for (const p of posts) {
  await tab.goto('about:blank');
  await tab.setContent(page(p), { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(root, 'images/blog', p.slug + '.jpg'), type: 'jpeg', quality: 88 });
  console.log('images/blog/' + p.slug + '.jpg');
}
await browser.close();
