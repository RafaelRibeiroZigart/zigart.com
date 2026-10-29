(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One reveal: blocks below the first screen rise in once as they enter.
  if (!reduce && 'IntersectionObserver' in window) {
    const sel = '.head, .set > li, .cards > li, .about__photo, .about__text, .table, .contact, .feature__media, .feature__text, .media-grid > li, .contact-page > *, .article__body > *';
    const els = [...document.querySelectorAll(sel)].filter((el) => el.getBoundingClientRect().top > innerHeight * 0.92);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => els.includes(c));
      el.style.setProperty('--i', Math.min(sibs.indexOf(el), 6));
      el.setAttribute('data-reveal', '');
      io.observe(el);
    });
  }

  // The name under construction: a ruler walks the letters on its own; touch one to measure it.
  const frame = document.querySelector('.construct__frame');
  if (frame) {
    const m = frame.querySelector('.measure');
    const val = m.querySelector('.measure__val');
    const hint = document.querySelector('[data-measure-hint]');
    const toggle = document.querySelector('[data-measure-toggle]');
    const letters = [...frame.querySelectorAll('.ch')].filter((c) => c.textContent.trim());
    let on = null, idx = 0, timer = null, seen = false, held = reduce;
    const show = (ch) => {
      if (!ch || ch === on) return;
      if (on) on.classList.remove('is-on');
      on = ch; ch.classList.add('is-on');
      const fr = frame.getBoundingClientRect(), r = ch.getBoundingClientRect();
      m.style.setProperty('--x', (r.left - fr.left) + 'px');
      m.style.setProperty('--w', (r.width / 100).toFixed(4));
      const name = ch.textContent.trim() ? ch.textContent : 'espaço';
      val.textContent = name + ' ' + ch.dataset.adv;
      if (hint) hint.textContent = name + ': ' + ch.dataset.adv + ' unidades';
      frame.classList.add('is-measuring');
    };
    const hide = () => {
      if (on) on.classList.remove('is-on');
      on = null; frame.classList.remove('is-measuring');
      if (hint) hint.textContent = hint.dataset.measureHint;
    };
    const step = () => { show(letters[idx % letters.length]); idx += 1; };
    const sync = () => {
      const run = seen && !held;
      if (run && !timer) { step(); timer = setInterval(step, 1400); }
      if (!run && timer) { clearInterval(timer); timer = null; }
      if (toggle) toggle.textContent = held ? 'Animar' : 'Pausar';
    };
    const holdAll = (v) => document.documentElement.classList.toggle('motion-held', v);
    const takeOver = (e) => { const ch = e.target.closest('.ch'); if (!ch) return; held = true; sync(); show(ch); idx = letters.indexOf(ch) + 1; };
    frame.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse') takeOver(e); });
    frame.addEventListener('pointerdown', takeOver);
    frame.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
    if (toggle) toggle.addEventListener('click', () => { held = !held; holdAll(held); if (held) hide(); sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }).observe(frame);
    if (reduce && toggle) toggle.hidden = true;
  }

  // Loops that can pause: still until in view, paused on hover and focus, with a visible control.
  document.querySelectorAll('[data-loop]').forEach((el) => {
    const btn = el.querySelector('[data-loop-toggle]');
    const s = { seen: false, hover: false, focus: false, held: reduce };
    const sync = () => {
      el.classList.toggle('is-running', s.seen && !s.hover && !s.focus && !s.held);
      if (btn) btn.textContent = s.held ? 'Animar' : 'Pausar';
    };
    if (btn) btn.addEventListener('click', () => { s.held = !s.held; sync(); });
    [['pointerenter', 'hover', true], ['pointerleave', 'hover', false], ['focusin', 'focus', true], ['focusout', 'focus', false]]
      .forEach(([t, k, v]) => el.addEventListener(t, (e) => { if (k === 'focus' && btn && e.target === btn) return; s[k] = v; sync(); }));
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { s.seen = e.isIntersecting; sync(); }).observe(el);
  });

  // The career index: an orange line fills as you read down it, and the row at the middle of the screen leans in.
  const set = document.querySelector('#trajetoria .set');
  if (set && !reduce) {
    const rows = [...set.children];
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = set.getBoundingClientRect(), mid = innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      set.style.setProperty('--p', p.toFixed(4));
      let cur = null;
      rows.forEach((li) => { const b = li.getBoundingClientRect(); if (b.top <= mid && b.bottom > mid) cur = li; });
      rows.forEach((li) => li.classList.toggle('is-current', li === cur));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  // Words that light up as the sentence passes the middle of the screen.
  const wordsEl = document.querySelector('[data-words]');
  if (wordsEl) {
    const parts = wordsEl.textContent.split(' ');
    wordsEl.innerHTML = parts.map((w) => '<span class="w">' + w + '</span>').join(' ');
    const ws = [...wordsEl.querySelectorAll('.w')];
    const light = () => {
      const r = wordsEl.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
    };
    let t = false;
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; light(); }); } }, { passive: true });
    light();
  }

  // The dot grid lives: a slow wave in the hero, and every grid leans toward the pointer.
  if (!reduce) {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;color:var(--color-ink)';
    document.body.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.style.color = 'var(--color-accent)';
    const accent = getComputedStyle(probe).color;
    probe.remove();
    const pointer = { x: -9999, y: -9999, at: 0 };
    const move = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now(); };
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', move, { passive: true });
    const STEP = 24, R = 150;
    document.querySelectorAll('.proof').forEach((host) => {
      const ambient = host.classList.contains('hero') || host.classList.contains('nav');
      const c = document.createElement('canvas');
      c.className = 'dots'; c.setAttribute('aria-hidden', 'true');
      host.prepend(c); host.classList.add('has-dots');
      const ctx = c.getContext('2d');
      let w = 0, h = 0, dpr = 1, seen = false, raf = 0;
      const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; c.width = w * dpr; c.height = h * dpr; };
      const draw = (now) => {
        raf = 0;
        if (!seen) return;
        const held = document.documentElement.classList.contains('motion-held');
        const wave = ambient && !held;
        const r = host.getBoundingClientRect();
        const px = pointer.x - r.left, py = pointer.y - r.top;
        const near = now - pointer.at < 1200 && px > -R && px < w + R && py > -R && py < h + R;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const t = now * 0.0007, top = r.top + scrollY;
        for (let y = STEP / 2; y < h; y += STEP) {
          for (let x = STEP / 2; x < w; x += STEP) {
            let dx = 0, dy = 0, rad = 1, k = 0;
            if (wave) {
              const a = Math.sin(t + x * 0.011 + (top + y) * 0.008) * Math.cos(t * 0.6 + x * 0.004);
              dy = a * 2.2; rad = 1 + (a + 1) * 0.22;
            }
            if (near) {
              const ddx = x - px, ddy = y - py, d = Math.hypot(ddx, ddy);
              if (d < R) { k = 1 - d / R; const push = k * k * 9; dx += (ddx / (d || 1)) * push; dy += (ddy / (d || 1)) * push; rad += k * 1.8; }
            }
            ctx.globalAlpha = k > 0.05 ? 0.25 + k * 0.6 : 0.2;
            ctx.fillStyle = k > 0.05 ? accent : ink;
            ctx.beginPath(); ctx.arc(x + dx, y + dy, rad, 0, 6.2832); ctx.fill();
          }
        }
        if (wave || near) raf = requestAnimationFrame(draw);
      };
      const kick = () => { if (!raf && seen) raf = requestAnimationFrame(draw); };
      addEventListener('pointermove', kick, { passive: true });
      addEventListener('pointerdown', kick, { passive: true });
      addEventListener('scroll', kick, { passive: true });
      new MutationObserver(kick).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      new ResizeObserver(() => { size(); kick(); }).observe(host);
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }).observe(host);
      size();
    });
  }
})();
