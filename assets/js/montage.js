// Trajectory — rapid-cut map montage. mountMontage(el, opts) -> { play, pause, toggle, go, destroy }
// Frames are inline SVG (real OSM / US-state vectors, see montage-frames.js) with HTML labels so type
// stays legible at every size. Cut timing runs on requestAnimationFrame; pauses on hover, focus,
// off-screen and hidden tab; prefers-reduced-motion shows the final frame with a play control.
// Keyboard: the plate is the one tab stop (Space/Enter toggles, arrows/Home/End step); the tick
// buttons are mouse targets. Focus rings come from the page's global :focus-visible. The caller
// must call destroy() when the element leaves the document (white.js does this on white:navigate).
// Stops: if el has data-montage-stops="<id>" (or a [data-montage-stops] list sits in the same section),
// the list item whose index matches the current frame's `stop` carries aria-current="step".
import { FRAMES, BASES, OG } from '/assets/js/montage-frames.js';

const NS = 'http://www.w3.org/2000/svg';
let instances = 0;

const CSS = `
.montage{--m-ink:var(--ink,#0b0d10);--m-paper:var(--paper,#fff);--m-paper-2:var(--paper-2,#f6f7f9);--m-graphite:var(--graphite,#3b3f45);--m-ash:var(--ash,#6b7078);--m-hair:var(--hair,rgba(11,13,16,.14));--m-signal:var(--signal,#c8ff00);
  position:relative;display:block;color:var(--m-ink);font-family:var(--mono,'Lab Grotesque Mono',ui-monospace,Menlo,monospace)}
.montage-plate{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--m-paper);border:1px solid var(--m-hair);container-type:inline-size}
.montage-plate--og{aspect-ratio:1200/630}
.montage-frame{position:absolute;inset:0}
.montage-frame[hidden]{display:block;visibility:hidden}
.montage-frame>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.montage-defs{position:absolute;width:0;height:0;overflow:hidden}
.montage-inset{position:absolute;background:var(--m-paper);border:1px solid var(--m-hair);overflow:hidden}
.montage-inset svg{position:absolute;inset:0;width:100%;height:100%}
.montage-mark{position:absolute;width:14px;height:14px;transform:translate(-50%,-50%);pointer-events:none}
.montage-mark::before,.montage-mark::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:1.5px;background:var(--m-ink);transform:translate(-50%,-50%) rotate(45deg)}
.montage-mark::after{transform:translate(-50%,-50%) rotate(-45deg)}
.montage-mark--o{border:1.5px solid var(--m-ink);border-radius:50%;width:22px;height:22px}
.montage-mark--o::before,.montage-mark--o::after{display:none}
.montage-dot{position:absolute;width:11px;height:11px;border-radius:50%;background:var(--m-signal);border:1.5px solid var(--m-ink);transform:translate(-50%,-50%);box-shadow:0 0 0 5px var(--m-paper),0 0 0 6px var(--m-hair)}
.montage-label{position:absolute;display:flex;flex-direction:column;align-items:flex-start;gap:.4em;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;line-height:1;pointer-events:none;font-size:clamp(11px,1.5cqw,18px)}
.montage-label--e{align-items:flex-end}
.montage-label span{display:inline-block;padding:.36em .5em .3em;background:var(--m-paper);color:var(--m-graphite);box-shadow:0 0 0 1px var(--m-ink);transform-origin:0 50%}
.montage-label--e span{transform-origin:100% 50%}
.montage-label span.montage-label__p{background:var(--m-paper);color:var(--m-ink);box-shadow:0 0 0 1px var(--m-ink);font-size:clamp(12px,1.75cqw,21px)}
.montage-label span.montage-label__gap{margin-top:.75em}
.montage-og-name{position:absolute;left:5.2%;top:9.5%;font-family:var(--sans,'Lab Grotesque',system-ui,sans-serif);font-weight:300;font-size:calc(1200px*.05);letter-spacing:-.02em;line-height:1;color:var(--m-ink);text-transform:none}
.montage-og-sub{position:absolute;left:5.2%;top:22%;font-size:calc(1200px*.0125);letter-spacing:.08em;text-transform:uppercase;color:var(--m-graphite)}
.montage-bar{display:flex;align-items:center;gap:16px;margin-top:10px;min-height:28px}
.montage-toggle{flex:none;width:28px;height:28px;display:grid;place-items:center;padding:0;border:1px solid var(--m-hair);background:var(--m-paper);color:var(--m-ink);cursor:pointer;border-radius:0}
.montage-toggle:hover{border-color:var(--m-ink)}
.montage-toggle svg{width:10px;height:10px;display:block;fill:currentColor}
.montage-toggle .montage-ico-play{display:none}
.montage[data-state="paused"] .montage-toggle .montage-ico-pause{display:none}
.montage[data-state="paused"] .montage-toggle .montage-ico-play{display:block}
.montage-ticks{flex:1;display:flex;gap:3px;list-style:none;margin:0;padding:0;height:28px;align-items:center;min-width:0}
.montage-ticks li{display:flex;height:100%;min-width:6px}
.montage-ticks button{display:block;width:100%;height:100%;padding:0;border:0;background:transparent;cursor:pointer;position:relative}
.montage-ticks button::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:var(--m-hair);transition:background .12s}
.montage-ticks button:hover::after{background:var(--m-ash)}
.montage-ticks button[aria-current="true"]::after{background:var(--m-ink)}
.montage-cap{flex:none;font-size:var(--t-mono,11px);letter-spacing:.06em;text-transform:uppercase;color:var(--m-ash);font-variant-numeric:tabular-nums;min-width:15ch;text-align:right;margin:0}
.montage-cap b{font-weight:400;color:var(--m-ink)}
.montage-cover{position:absolute;inset:0;display:grid;place-items:center;background:transparent;border:0;cursor:pointer;padding:0}
.montage-cover span{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;background:var(--m-paper);border:1px solid var(--m-ink);font:inherit;font-size:var(--t-mono,11px);letter-spacing:.08em;text-transform:uppercase;color:var(--m-ink)}
.montage-cover svg{width:10px;height:10px;fill:currentColor}
.montage-cover[hidden]{display:none}
@media (max-width:640px){.montage-bar{flex-wrap:wrap}.montage-cap{width:100%;text-align:left;min-width:0;order:3}.montage-mark{width:10px;height:10px}.montage-mark::before,.montage-mark::after{width:10px}.montage-mark--o{width:16px;height:16px}}
@container (max-width:640px){.montage-frame[data-id="summary"] .montage-label--s{display:none}.montage-frame[data-id="summary"] .montage-label--p{left:3%!important;top:4%!important;transform:none!important}}
@media print{.montage-plate{background:#fff}.montage-bar{display:none}}
`;

function ensureStyle() {
  if (document.getElementById('montage-style')) return;
  const s = document.createElement('style');
  s.id = 'montage-style';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

// Inline styles (not classes): paths are reused through <use>, whose shadow tree does not match our selectors.
const STROKE = 'fill:none;stroke:var(--m-ink);stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;';
const STYLE = {
  water: 'fill:var(--m-paper-2);stroke:none;fill-rule:evenodd',
  land: 'fill:var(--m-paper);stroke:var(--m-ink);stroke-opacity:.85;stroke-width:1.1;stroke-linejoin:round;vector-effect:non-scaling-stroke',
  coast: STROKE + 'stroke-opacity:.5;stroke-width:1',
  border: STROKE + 'stroke-opacity:.32;stroke-width:1',
  st1: STROKE + 'stroke-opacity:.55;stroke-width:1.15',
  st2: STROKE + 'stroke-opacity:.34;stroke-width:1',
  st3: STROKE + 'stroke-opacity:.15;stroke-width:.8',
  rail: STROKE + 'stroke-opacity:.35;stroke-width:1;stroke-dasharray:2 3',
  route: STROKE + 'stroke-width:1.5;stroke-dasharray:7 5;stroke-linecap:butt',
  'route-faint': STROKE + 'stroke-opacity:.18;stroke-width:1.2;stroke-dasharray:7 5;stroke-linecap:butt',
};

function layersInto(g, layers) {
  for (const l of layers) {
    if (!l.d) continue;
    g.appendChild(svgEl('path', { class: 'montage-' + l.c, d: l.d, style: STYLE[l.c] || STROKE }));
  }
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// A label is a column of highlighter lines. A primary ('p') label and a secondary ('s') one in the same
// column are rendered as one group so they never overlap when the plate is narrow and type hits its floor size.
function labelGroups(labels) {
  const out = [];
  const used = new Set();
  for (const lb of labels) {
    if (used.has(lb) || lb.k !== 'p') continue;
    const s = labels.find((o) => o !== lb && o.k !== 'p' && !used.has(o) && o.x === lb.x && (o.a || '') === (lb.a || '') && o.y > lb.y);
    used.add(lb); if (s) used.add(s);
    out.push(s ? { x: lb.x, y: lb.y, a: lb.a, parts: [lb, s] } : { x: lb.x, y: lb.y, a: lb.a, parts: [lb] });
  }
  for (const lb of labels) if (!used.has(lb)) out.push({ x: lb.x, y: lb.y, a: lb.a, parts: [lb] });
  return out;
}

function label(g) {
  const wrap = el('div', 'montage-label' + (g.a === 'e' ? ' montage-label--e' : '') + (g.parts[0].k === 'p' ? ' montage-label--p' : ' montage-label--s'));
  wrap.style.left = g.x + '%';
  wrap.style.top = g.y + '%';
  if (g.a === 'e') wrap.style.transform = 'translateX(-100%)';
  g.parts.forEach((part, pi) => {
    part.lines.forEach((line, li) => {
      const sp = el('span', (part.k === 'p' ? 'montage-label__p' : 'montage-label__s') + (pi > 0 && li === 0 ? ' montage-label__gap' : ''), line);
      const r = Math.max(-1.5, Math.min(1.5, (part.r || 0) * (li % 2 ? -0.6 : 1)));
      sp.style.transform = r ? 'rotate(' + r.toFixed(2) + 'deg)' : '';
      wrap.appendChild(sp);
    });
  });
  return wrap;
}

function mark(m) {
  const e = el('span', 'montage-mark' + (m.t === 'o' ? ' montage-mark--o' : ''));
  e.style.left = m.x + '%'; e.style.top = m.y + '%';
  e.setAttribute('aria-hidden', 'true');
  return e;
}

// Builds one frame's DOM. defs: {svg, ids:Map} shared per mount for <use> of base maps.
export function renderFrame(frame, defs, uid) {
  const W = frame.w || 1200, H = frame.h || 900;
  const f = el('div', 'montage-frame');
  f.dataset.id = frame.id;
  const svg = svgEl('svg', { class: 'montage-svg', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', focusable: 'false' });
  if (frame.base) {
    let id = defs.ids.get(frame.base);
    if (!id) {
      id = `montage-${uid}-base-${defs.ids.size}`;
      const g = svgEl('g', { id });
      layersInto(g, BASES[frame.base].layers);
      defs.svg.appendChild(g);
      defs.ids.set(frame.base, id);
    }
    svg.appendChild(svgEl('use', { href: '#' + id }));
  }
  layersInto(svg, frame.layers);
  f.appendChild(svg);
  if (frame.inset) {
    const ins = frame.inset;
    const box = el('div', 'montage-inset');
    box.style.left = ins.x / W * 100 + '%'; box.style.top = ins.y / H * 100 + '%';
    box.style.width = ins.w / W * 100 + '%'; box.style.height = ins.h / H * 100 + '%';
    const isvg = svgEl('svg', { class: 'montage-svg', viewBox: `0 0 ${ins.w} ${ins.h}`, 'aria-hidden': 'true' });
    layersInto(isvg, ins.layers);
    box.appendChild(isvg);
    for (const m of ins.marks || []) box.appendChild(mark({ x: m.x / ins.w * 100, y: m.y / ins.h * 100, t: m.t }));
    if (ins.end) {
      const d = el('span', 'montage-dot');
      d.style.left = ins.end[0] / ins.w * 100 + '%'; d.style.top = ins.end[1] / ins.h * 100 + '%';
      d.style.width = d.style.height = '7px'; d.style.boxShadow = 'none';
      box.appendChild(d);
    }
    f.appendChild(box);
    if (ins.label) {
      const lb = Object.assign({}, ins.label, { x: ins.x / W * 100, y: (ins.y + ins.h) / H * 100 + 1.4, r: -1 });
      f.appendChild(label({ x: lb.x, y: lb.y, parts: [lb] }));
    }
  }
  for (const m of frame.marks || []) f.appendChild(mark(m));
  if (frame.dot) {
    const d = el('span', 'montage-dot');
    d.style.left = frame.dot[0] + '%'; d.style.top = frame.dot[1] + '%';
    d.setAttribute('aria-hidden', 'true');
    f.appendChild(d);
  }
  for (const g of labelGroups(frame.labels || [])) f.appendChild(label(g));
  return f;
}

export function renderOG(host) {
  ensureStyle();
  const uid = 'og';
  const defs = { svg: svgEl('svg', { class: 'montage-defs', 'aria-hidden': 'true' }), ids: new Map() };
  const root = el('div', 'montage');
  const plate = el('div', 'montage-plate montage-plate--og');
  plate.appendChild(defs.svg);
  plate.appendChild(renderFrame(OG, defs, uid));
  const name = el('div', 'montage-og-name', 'Prannay Hebbar');
  const sub = el('div', 'montage-og-sub', 'Founder · San Francisco · prannayh.com');
  plate.appendChild(name); plate.appendChild(sub);
  root.appendChild(plate);
  host.appendChild(root);
  return root;
}

const ICON_PLAY = '<svg viewBox="0 0 10 10" class="montage-ico-play" aria-hidden="true"><path d="M1 0l9 5-9 5z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 10 10" class="montage-ico-pause" aria-hidden="true"><path d="M1 0h3v10H1zM6 0h3v10H6z"/></svg>';

export function mountMontage(el0, opts = {}) {
  ensureStyle();
  const uid = ++instances;
  const frames = opts.frames || FRAMES;
  const reduced = opts.reducedMotion ?? (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // static fallback (noscript / img / picture / video) goes away
  for (const c of Array.from(el0.children)) {
    if (/^(NOSCRIPT|IMG|PICTURE|VIDEO)$/.test(c.tagName) || c.hasAttribute('data-montage-fallback')) c.remove();
  }
  el0.classList.add('montage');
  el0.setAttribute('role', 'group');
  el0.setAttribute('aria-roledescription', 'animated map sequence');
  if (!el0.hasAttribute('aria-label')) el0.setAttribute('aria-label', 'Trajectory: Dallas, January 2023, to San Francisco, July 2026, in ' + frames.length + ' map frames');

  const plate = el('div', 'montage-plate');
  plate.tabIndex = 0;
  plate.setAttribute('role', 'group');
  plate.setAttribute('aria-label', 'Trajectory frames. Space plays or pauses, arrow keys step');
  const defs = { svg: svgEl('svg', { class: 'montage-defs', 'aria-hidden': 'true' }), ids: new Map() };
  plate.appendChild(defs.svg);
  const nodes = frames.map((f) => { const n = renderFrame(f, defs, uid); n.hidden = true; plate.appendChild(n); return n; });

  const cover = el('button', 'montage-cover');
  cover.type = 'button';
  cover.innerHTML = '<span>' + ICON_PLAY.replace('class="montage-ico-play" ', '') + 'Play the sequence</span>';
  cover.setAttribute('aria-label', 'Play the montage');
  cover.hidden = true;
  plate.appendChild(cover);

  const bar = el('div', 'montage-bar');
  const toggle = el('button', 'montage-toggle');
  toggle.type = 'button';
  toggle.innerHTML = ICON_PAUSE + ICON_PLAY;
  const ticks = el('ol', 'montage-ticks');
  ticks.setAttribute('aria-label', 'Frames');
  const tickBtns = frames.map((f, i) => {
    const li = el('li'); li.style.flex = String(f.dur);
    const b = el('button'); b.type = 'button'; b.tabIndex = -1;
    b.setAttribute('aria-label', `Frame ${i + 1}: ${f.place}, ${f.when}`);
    b.addEventListener('click', () => { userPaused = true; go(i); sync(); });
    li.appendChild(b); ticks.appendChild(li);
    return b;
  });
  const cap = el('p', 'montage-cap');
  bar.append(toggle, ticks, cap);
  el0.append(plate, bar);

  // the itinerary beside the plate: the current stop is marked as the frames go by
  let stops = [];
  {
    const id = el0.dataset.montageStops;
    const list = (id && document.getElementById(id)) || (el0.closest('section, .section') || el0.parentElement || document).querySelector('[data-montage-stops]');
    if (list) stops = Array.from(list.children);
  }

  // ---- state
  let i = reduced ? frames.length - 1 : 0;
  let userPaused = !!reduced;
  let hover = false, focus = false, visible = true, hidden = document.hidden;
  let raf = 0, last = 0, acc = 0;
  let destroyed = false;

  const playing = () => !userPaused && !hover && !focus && visible && !hidden && !destroyed;

  function show(k) {
    nodes[i].hidden = true;
    i = (k + frames.length) % frames.length;
    nodes[i].hidden = false;
    const f = frames[i];
    cap.innerHTML = '';
    cap.appendChild(el('b', null, f.place));
    cap.appendChild(document.createTextNode(' · ' + f.when));
    tickBtns.forEach((b, j) => { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (stops.length) {
      const st = f.stop == null || f.stop < 0 ? stops.length - 1 : Math.min(f.stop, stops.length - 1);
      stops.forEach((li, j) => { if (j === st) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    }
  }
  function go(k) { acc = 0; show(k); }

  function tick(now) {
    raf = 0;
    if (!playing()) return;
    const dt = Math.min(now - last, 250);
    last = now;
    acc += dt;
    if (acc >= frames[i].dur) { acc -= frames[i].dur; show(i + 1); if (acc >= frames[i].dur) acc = 0; }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    const p = playing();
    el0.dataset.state = p ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', p ? 'Pause the montage' : 'Play the montage');   // the label follows what is on screen
    cap.setAttribute('aria-live', p ? 'off' : 'polite');
    cover.hidden = !(userPaused && reduced && !started);
    if (p && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!p && raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  let started = !reduced;

  function play() { userPaused = false; focus = false; started = true; sync(); }
  function pause() { userPaused = true; sync(); }
  function toggleFn() { playing() ? pause() : play(); }                                 // one press does what the label says

  toggle.addEventListener('click', toggleFn);
  cover.addEventListener('click', () => { go(0); play(); plate.focus({ preventScroll: true }); });
  plate.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
  plate.addEventListener('pointerleave', () => { hover = false; sync(); });
  el0.addEventListener('focusin', () => { focus = true; sync(); });
  el0.addEventListener('focusout', (e) => { if (!el0.contains(e.relatedTarget)) { focus = false; sync(); } });
  plate.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleFn(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); userPaused = true; go(i + 1); sync(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); userPaused = true; go(i - 1); sync(); }
    else if (e.key === 'Home') { e.preventDefault(); userPaused = true; go(0); sync(); }
    else if (e.key === 'End') { e.preventDefault(); userPaused = true; go(frames.length - 1); sync(); }
  });
  const onVis = () => { hidden = document.hidden; sync(); };
  document.addEventListener('visibilitychange', onVis);
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => { visible = es.some((x) => x.isIntersecting); sync(); }, { threshold: 0.15 });
    io.observe(plate);
  }

  // labels are placed in % of the plate; on narrow plates a long line can run past the right edge — pull it back
  const labels = Array.from(plate.querySelectorAll('.montage-label'));
  function fit() {
    const pr = plate.getBoundingClientRect();
    if (!pr.width) return;
    for (const lb of labels) {
      lb.style.marginLeft = ''; lb.style.marginTop = '';
      const r = lb.getBoundingClientRect();
      const over = r.right - pr.right + 6;
      if (over > 0) lb.style.marginLeft = -Math.min(over, r.left - pr.left - 6) + 'px';
      const below = r.bottom - pr.bottom + 6;
      if (below > 0) lb.style.marginTop = -Math.min(below, r.top - pr.top - 6) + 'px';
    }
  }
  let ro = null;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(fit); ro.observe(plate); }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) fit(); });   // mono metrics settle late

  show(i);
  sync();

  return {
    play, pause, toggle: toggleFn, go: (k) => { userPaused = true; go(k); sync(); },
    get frame() { return i; },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      el0.innerHTML = '';
      el0.classList.remove('montage');
    },
  };
}

export default mountMontage;
