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

  // The name under construction: point at a letter to measure its advance.
  const frame = document.querySelector('.construct__frame');
  if (frame) {
    const m = frame.querySelector('.measure');
    const val = m.querySelector('.measure__val');
    const hint = document.querySelector('[data-measure-hint]');
    let on = null;
    const show = (ch) => {
      if (!ch || ch === on) return;
      if (on) on.classList.remove('is-on');
      on = ch; ch.classList.add('is-on');
      const fr = frame.getBoundingClientRect(), r = ch.getBoundingClientRect();
      m.style.setProperty('--x', (r.left - fr.left) + 'px');
      m.style.setProperty('--w', (r.width / 100).toFixed(4));
      const name = ch.textContent.trim() ? ch.textContent : 'espaço';
      val.textContent = name + ' ' + ch.dataset.adv;
      if (hint) hint.textContent = 'Avanço de ' + name + ': ' + ch.dataset.adv + ' unidades';
      frame.classList.add('is-measuring');
    };
    const hide = () => {
      if (on) on.classList.remove('is-on');
      on = null; frame.classList.remove('is-measuring');
      if (hint) hint.textContent = hint.dataset.measureHint;
    };
    frame.addEventListener('pointerover', (e) => show(e.target.closest('.ch')));
    frame.addEventListener('pointerdown', (e) => show(e.target.closest('.ch')));
    frame.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
  }
})();
