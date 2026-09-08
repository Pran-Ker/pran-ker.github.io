/* gallery.js — column masonry on white. mountGallery(el) → Promise<{ destroy }>
   el is [data-gallery]; el.dataset.src is the manifest (default /assets/gallery/manifest.json).
   Items are placed shortest-column-first in chronological order (year, then manifest order), 4 / 3 / 2
   equal columns (1100px, 720px). Filtering re-flows with a FLIP transition: leaving items fade, the rest
   are measured, moved, and animated back from where they were; entering items fade in. Videos autoplay
   muted while in view and pause off-screen; a reader's pause outlasts scrolling. One lightbox on body
   (←/→/Esc, swipe, focus trap, click outside closes) shows album · year under the image.
   Everything mounted here is torn down by destroy() (white.js calls it on white:navigate). */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  kids.forEach(k => k != null && n.append(k));
  return n;
};

const ICO_PLAY = '<svg class="ico-off" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1.5v7l6-3.5z" fill="currentColor"/></svg>';
const ICO_PAUSE = '<svg class="ico-on" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 1.5h1.6v7H2.5zM5.9 1.5h1.6v7H5.9z" fill="currentColor"/></svg>';
const ICO_PREV = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 1.5 3 6l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
const ICO_NEXT = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 1.5 9 6l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
const ICO_CLOSE = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';

const COLS_3 = '(max-width: 1100px)', COLS_2 = '(max-width: 720px)';   // iPad landscape and small laptops read better at three
const colsFor = () => matchMedia(COLS_2).matches ? 2 : matchMedia(COLS_3).matches ? 3 : 4;
const nf = new Intl.NumberFormat('en-US');

export async function mountGallery(el) {
  const src = el.dataset.src || '/assets/gallery/manifest.json';
  let raw;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    raw = await res.json();
  } catch (e) {
    el.innerHTML = '';
    el.append(h('p', { class: 'small' }, 'The photos did not load. ', h('a', { class: 'link', href: location.pathname, 'data-no-router': '' }, 'Try again')));
    return { destroy() {} };
  }
  if (!el.isConnected) return { destroy() {} };

  /* ---------------------------------------------------------------- data: chronological, stable */
  const all = raw.map((d, i) => ({ ...d, i })).sort((a, b) => (a.year - b.year) || (a.i - b.i));
  const albums = [];
  for (const it of all) if (!albums.some(a => a.id === it.album)) albums.push({ id: it.album, title: it.albumTitle, year: it.year, n: all.filter(x => x.album === it.album).length });
  all.forEach(it => { it.k = all.filter(x => x.album === it.album && x.i <= it.i).length; it.albumN = albums.find(a => a.id === it.album).n; });
  const nameOf = it => `${it.albumTitle}, ${it.year}`;
  const altOf = it => it.alt || `${nameOf(it)} — ${it.kind === 'video' ? 'video' : 'photo'} ${it.k} of ${it.albumN}`;   // a manifest `alt` wins over the positional one

  /* ---------------------------------------------------------------- skeleton */
  el.innerHTML = '';
  const count = h('p', { class: 'gallery__count', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const filters = h('div', { class: 'gallery__filters', role: 'group', 'aria-label': 'Albums' });
  const pill = (id, label) => h('button', { class: 'gallery__filter', type: 'button', 'aria-pressed': 'false', 'data-album': id, text: label });
  filters.append(pill('', 'All'));
  albums.forEach(a => filters.append(pill(a.id, a.title)));
  const head = h('div', { class: 'gallery__head' }, count, filters);
  const cols = h('div', { class: 'gallery__cols' });
  el.append(head, cols);

  /* ---------------------------------------------------------------- items */
  const videoIo = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    const it = byEl.get(en.target); if (!it || !it.video) return;
    if (en.isIntersecting) { if (!it.userPaused && it.video.paused && !it.el.hidden) it.video.play().catch(() => {}); }
    else if (!it.video.paused) it.video.pause();
  }), { threshold: .25 }) : null;
  const byEl = new Map();

  const loaded = it => it.el.classList.add('is-loaded');
  for (const it of all) {
    const ar = `--ar: ${it.w} / ${it.h}`;
    if (it.kind === 'video') {
      const video = h('video', { muted: true, loop: true, playsinline: true, preload: 'none', poster: it.poster, width: it.w, height: it.h, 'aria-hidden': 'true', tabindex: '-1' });
      video.muted = true;
      const open = h('a', { class: 'gallery__open', href: it.src, 'aria-label': altOf(it) + '. Open' }, video);
      const play = h('button', { class: 'gallery__play', type: 'button', 'data-on': 'false', html: ICO_PLAY + ICO_PAUSE });
      it.el = h('div', { class: 'gallery__item gallery__item--video', style: ar }, open, play);
      it.video = video; it.play = play; it.userPaused = reduced; it.open = open;
      const sync = () => { const on = !video.paused; play.dataset.on = on ? 'true' : 'false'; play.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} ${nameOf(it)} clip`); };
      video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
      play.addEventListener('click', () => { if (video.paused) { it.userPaused = false; video.play().catch(() => {}); } else { it.userPaused = true; video.pause(); } });
      const poster = new Image(); poster.onload = poster.onerror = () => loaded(it); poster.src = it.poster;
      videoIo && videoIo.observe(it.el);
    } else {
      const img = h('img', { src: it.thumb || it.src, width: it.w, height: it.h, alt: altOf(it), loading: 'lazy', decoding: 'async' });
      it.el = h('a', { class: 'gallery__item', href: it.src, style: ar }, img);
      it.open = it.el;
      if (img.complete && img.naturalWidth) loaded(it);
      else { img.addEventListener('load', () => loaded(it), { once: true }); img.addEventListener('error', () => loaded(it), { once: true }); }
    }
    it.el.hidden = true;
    byEl.set(it.el, it);
  }

  /* ---------------------------------------------------------------- layout: shortest column first */
  let nCols = 0, colEls = [], current = null, shown = [];
  const layout = list => {
    const n = colsFor();
    if (n !== nCols) {
      nCols = n; cols.style.setProperty('--cols', n);
      colEls.forEach(c => c.remove()); colEls = [];
      for (let i = 0; i < n; i++) { const c = h('div', { class: 'gallery__col' }); colEls.push(c); cols.append(c); }
    }
    const gap = parseFloat(getComputedStyle(cols).columnGap) || 24;
    const colW = Math.max(1, (cols.clientWidth - gap * (n - 1)) / n);
    const gapU = gap / colW;
    const heights = new Array(n).fill(0);
    for (const it of list) {
      let c = 0; for (let i = 1; i < n; i++) if (heights[i] < heights[c] - 1e-6) c = i;
      colEls[c].append(it.el); it.el.hidden = false;
      heights[c] += it.h / it.w + gapU;
    }
    for (const it of all) if (!list.includes(it)) { it.el.hidden = true; if (it.video && !it.video.paused) it.video.pause(); }
    shown = list;
  };

  /* ---------------------------------------------------------------- filter + FLIP */
  let token = 0;
  const setLabel = album => {
    const a = albums.find(x => x.id === album);
    count.textContent = a ? `${a.title} · ${nf.format(a.n)}` : `All photos · ${nf.format(all.length)}`;
    $$('.gallery__filter', filters).forEach(b => b.setAttribute('aria-pressed', String((b.dataset.album || '') === (album || ''))));
  };
  const apply = (album, animate) => {
    if (album && !albums.some(a => a.id === album)) album = '';
    if (album === current) return;
    current = album;
    setLabel(album);
    try { history.replaceState(history.state, '', album ? `#${album}` : location.pathname + location.search); } catch {}
    const next = album ? all.filter(it => it.album === album) : all;
    const my = ++token;
    all.forEach(it => it.el.classList.remove('is-leaving'));     // a superseded fade must not leave items invisible
    if (!animate || reduced) { layout(next); return; }
    const before = shown.slice();
    const leaving = before.filter(it => !next.includes(it));
    leaving.forEach(it => it.el.classList.add('is-leaving'));
    const go = () => {
      if (my !== token) return;
      leaving.forEach(it => it.el.classList.remove('is-leaving'));
      const first = new Map(before.map(it => [it, it.el.getBoundingClientRect()]));
      layout(next);
      const moving = [], entering = [];
      for (const it of next) {
        const f = first.get(it);
        if (!f) { it.el.classList.add('is-entering'); entering.push(it.el); continue; }
        const l = it.el.getBoundingClientRect();
        const dx = f.left - l.left, dy = f.top - l.top;
        if (Math.abs(dx) < .5 && Math.abs(dy) < .5) continue;
        it.el.style.transform = `translate(${dx}px, ${dy}px)`;
        moving.push(it.el);
      }
      cols.getBoundingClientRect();                          // commit the inverse transforms before they animate
      requestAnimationFrame(() => {
        moving.forEach(n => { n.classList.add('is-moving'); n.style.transform = ''; });
        entering.forEach(n => { n.classList.add('is-moving'); n.classList.remove('is-entering'); });
        const done = e => { if (e.target.classList.contains('gallery__item')) e.target.classList.remove('is-moving'); };
        [...moving, ...entering].forEach(n => n.addEventListener('transitionend', done, { once: true }));
        setTimeout(() => [...moving, ...entering].forEach(n => n.classList.remove('is-moving')), 600);
      });
    };
    leaving.length ? setTimeout(go, 170) : go();
  };
  filters.addEventListener('click', e => { const b = e.target.closest('.gallery__filter'); if (b) apply(b.dataset.album || '', true); });

  /* ---------------------------------------------------------------- lightbox */
  const lb = h('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lightbox-cap', hidden: true });
  const lbClose = h('button', { class: 'lightbox__btn lightbox__btn--close', type: 'button', 'aria-label': 'Close', html: ICO_CLOSE });
  const lbPrev = h('button', { class: 'lightbox__btn lightbox__btn--prev', type: 'button', 'aria-label': 'Previous', html: ICO_PREV });
  const lbNext = h('button', { class: 'lightbox__btn lightbox__btn--next', type: 'button', 'aria-label': 'Next', html: ICO_NEXT });
  const lbImg = h('img', { class: 'lightbox__img', alt: '', hidden: true });
  const lbVideo = h('video', { muted: true, loop: true, playsinline: true, preload: 'auto', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
  lbVideo.muted = true;
  const lbPlay = h('button', { class: 'gallery__play', type: 'button', 'data-on': 'false', 'aria-label': 'Play clip', html: ICO_PLAY + ICO_PAUSE, hidden: true });
  const lbPic = h('div', { class: 'lightbox__pic' }, lbImg, lbVideo, lbPlay);
  const lbMedia = h('div', { class: 'lightbox__media' }, lbPic);
  const lbStage = h('div', { class: 'lightbox__stage' }, lbPrev, lbMedia, lbNext);
  // the picture box is sized from the item's own w/h to fit the cell: no reliance on an unloaded video's intrinsic size
  let lbItem = null;
  const fit = () => {
    if (!lbItem || lb.hidden) return;
    const W = lbMedia.clientWidth, H = lbMedia.clientHeight; if (!W || !H) return;
    const k = Math.min(W / lbItem.w, H / lbItem.h);
    lbPic.style.width = `${Math.round(lbItem.w * k)}px`; lbPic.style.height = `${Math.round(lbItem.h * k)}px`;
  };
  const ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null;
  ro && ro.observe(lbMedia);
  const lbCap = h('p', { class: 'lightbox__cap', id: 'lightbox-cap', 'aria-live': 'polite' }, h('span'));
  lb.append(h('div', { class: 'lightbox__bar' }, h('span'), lbClose), lbStage, lbCap);
  document.body.append(lb);

  let lbIndex = -1, opener = null, lbUserPaused = reduced;
  const lbSync = () => { const on = !lbVideo.paused; lbPlay.dataset.on = on ? 'true' : 'false'; lbPlay.setAttribute('aria-label', on ? 'Pause clip' : 'Play clip'); };
  lbVideo.addEventListener('play', lbSync); lbVideo.addEventListener('pause', lbSync);
  lbPlay.addEventListener('click', () => { if (lbVideo.paused) { lbUserPaused = false; lbVideo.play().catch(() => {}); } else { lbUserPaused = true; lbVideo.pause(); } });

  const show = i => {
    const list = shown; if (!list.length) return;
    lbIndex = (i + list.length) % list.length;
    const it = list[lbIndex];
    lbItem = it; fit();
    lbMedia.classList.remove('is-ready');
    lbVideo.pause();
    if (it.kind === 'video') {
      lbImg.hidden = true; lbImg.removeAttribute('src');
      lbVideo.hidden = false; lbPlay.hidden = false;
      lbVideo.poster = it.poster; lbVideo.width = it.w; lbVideo.height = it.h;
      if (lbVideo.getAttribute('src') !== it.src) lbVideo.src = it.src;
      lbMedia.classList.add('is-ready');
      if (!lbUserPaused) lbVideo.play().catch(() => {});
      lbSync();
    } else {
      lbVideo.hidden = true; lbPlay.hidden = true; lbVideo.removeAttribute('src');
      lbImg.hidden = false;
      lbImg.width = it.w; lbImg.height = it.h;
      lbImg.alt = altOf(it);
      if (lbImg.getAttribute('src') !== it.src) lbImg.src = it.src;
      if (lbImg.complete && lbImg.naturalWidth) lbMedia.classList.add('is-ready');
      else lbImg.addEventListener('load', () => lbMedia.classList.add('is-ready'), { once: true });
      for (const d of [1, -1]) { const nb = list[(lbIndex + d + list.length) % list.length]; if (nb.kind !== 'video') { const p = new Image(); p.src = nb.src; } }
    }
    lbCap.firstChild.textContent = `${it.albumTitle} · ${it.year}`;
    lbPrev.disabled = lbNext.disabled = list.length < 2;
  };
  const INERT = '.hud, main#main, footer.foot';
  const open = it => {
    opener = it.open || it.el;
    show(shown.indexOf(it));
    lb.hidden = false;
    fit();
    document.body.classList.add('has-lightbox');
    $$(INERT).forEach(n => { n.inert = true; });
    document.addEventListener('keydown', onKey);
    lbClose.focus();
  };
  const close = () => {
    if (lb.hidden) return;
    lb.hidden = true;
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbImg.removeAttribute('src');
    document.body.classList.remove('has-lightbox');
    $$(INERT).forEach(n => { n.inert = false; });
    document.removeEventListener('keydown', onKey);
    const back = opener; opener = null;
    if (back && back.isConnected) back.focus({ preventScroll: false });
  };
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(lbIndex + 1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(lbIndex - 1); return; }
    if (e.key === 'Tab') {                                   // the dialog holds focus
      const f = $$('button:not([hidden]):not(:disabled)', lb);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    }
  };
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(lbIndex - 1));
  lbNext.addEventListener('click', () => show(lbIndex + 1));
  // swipe: a horizontal drag of 40px on the stage moves one picture. The click that follows a swipe is not a click-outside.
  let sx = 0, sy = 0, sid = null, swiped = false;
  lbStage.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button !== 0) return; sid = e.pointerId; sx = e.clientX; sy = e.clientY; swiped = false; }, { passive: true });
  lbStage.addEventListener('pointerup', e => {
    if (e.pointerId !== sid) return; sid = null;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; show(lbIndex + (dx < 0 ? 1 : -1)); }
  });
  lbStage.addEventListener('pointercancel', () => { sid = null; });
  lb.addEventListener('click', e => {
    if (swiped) { swiped = false; return; }
    if (e.target === lb || e.target === lbStage || e.target === lbMedia || e.target.classList.contains('lightbox__bar') || e.target === lbCap) close();
  });
  addEventListener('resize', fit);

  cols.addEventListener('click', e => {
    const a = e.target.closest('.gallery__open, a.gallery__item'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const it = byEl.get(a.closest('.gallery__item')); if (!it) return;
    e.preventDefault();
    open(it);
  });

  /* ---------------------------------------------------------------- first layout, resize */
  const initial = decodeURIComponent(location.hash.slice(1));
  apply(albums.some(a => a.id === initial) ? initial : '', false);
  const mqs = [matchMedia(COLS_2), matchMedia(COLS_3)];
  const onMq = () => { if (colsFor() !== nCols) layout(shown); };
  mqs.forEach(m => m.addEventListener('change', onMq));
  const onHash = () => { const a = decodeURIComponent(location.hash.slice(1)); if (albums.some(x => x.id === a) || a === '') apply(a, true); };
  addEventListener('hashchange', onHash);

  return {
    destroy() {
      token++;
      close();
      videoIo && videoIo.disconnect();
      ro && ro.disconnect();
      removeEventListener('resize', fit);
      mqs.forEach(m => m.removeEventListener('change', onMq));
      removeEventListener('hashchange', onHash);
      document.removeEventListener('keydown', onKey);
      lb.remove();
      all.forEach(it => { if (it.video) { it.video.pause(); it.video.removeAttribute('src'); } });
    },
  };
}

export default mountGallery;
