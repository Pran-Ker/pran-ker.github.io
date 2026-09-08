/* white.js — the shell. gate → music → router → HUD transport → page scripts → reveal → auto-mount.
   window.WHITE = { music, router, cubes, bpm: 125, beat(cb), clock }

   Boot order. This module is loaded from <head> with <script type="module" src="/assets/js/white.js">.
   Module scripts are deferred and run in document order, so boot() has run before any
   <script type="module" data-page> inside <main> executes on a hard load, and window.WHITE exists.
   boot() also dispatches `white:ready` on window; a page script that might run first can do
     window.WHITE || await new Promise(r => addEventListener('white:ready', r, { once: true }));
   After a router swap, page scripts are re-created as inline module scripts (a fresh element executes;
   the one that arrived through innerHTML never does) and WHITE is already there. Inline, not blob:
   a blob: URL is not a hierarchical base, so `import ... from '/assets/js/montage.js'` would fail
   to resolve inside a blob module.

   One beat clock. It writes --beat (0..1 envelope) to :root once per frame; CSS and cubes read it.
   DEBUG must be false in production: it is the only thing that honours review query flags
   (?entered=1 skip gate · ?gate=1 force gate · ?nogl=1 CSS fallback · ?debug=1 measurements). */

const DEBUG = false;

const BPM = 125;
const BEAT_MS = 60000 / BPM;
const VIDEO_ID = 'DpYfeTNkodQ';
const ENTERED_KEY = 'white.entered';
const MUTE_KEY = 'white.mute';
const VOL_KEY = 'white.volume';
const MODES = new Set(['home', 'writing', 'essay', 'principles', 'gallery', 'more', 'contact', 'void']);   // the cube formations that exist

const html = document.documentElement;
const q = DEBUG ? new URLSearchParams(location.search) : new URLSearchParams();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
};
const setText = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };
const modeOf = page => (MODES.has(page) ? page : 'home');
const pageMode = () => modeOf(html.dataset.page);

/* ------------------------------------------------------------------ beat clock
   Free-running until the track plays, then anchored to media time. The hand-off keeps the phase the
   field was breathing at and blends it away over one bar, so nothing jumps. Re-anchoring only happens
   when the player's reported time has drifted more than 60 ms from our own clock. */
const clock = {
  t0: performance.now(), synced: false, mediaTime: 0, syncAt: 0, off: 0, offAt: 0,
  mediaBeats() { return ((this.mediaTime + (performance.now() - this.syncAt) / 1000) * BPM) / 60; },
  beats() {
    if (!this.synced) return (performance.now() - this.t0) / BEAT_MS;
    const k = Math.max(0, 1 - (performance.now() - this.offAt) / (4 * BEAT_MS));   // one bar
    return this.mediaBeats() + this.off * k;
  },
  sync(mediaTime) {
    const now = performance.now();
    if (!this.synced) {
      const free = this.beats(), target = (mediaTime * BPM) / 60;
      let off = ((free - target) % 1 + 1) % 1; if (off > .5) off -= 1;
      this.off = off; this.offAt = now;
      this.synced = true; this.mediaTime = mediaTime; this.syncAt = now;
      return;
    }
    const drift = (mediaTime - (this.mediaTime + (now - this.syncAt) / 1000)) * 1000;
    if (Math.abs(drift) > 60) { this.mediaTime = mediaTime; this.syncAt = now; }
  },
  unsync() {
    if (!this.synced) return;
    const b = this.beats(); this.synced = false; this.off = 0; this.t0 = performance.now() - b * BEAT_MS;
  },
};
const beatSubs = new Set();
const beat = cb => { beatSubs.add(cb); return () => beatSubs.delete(cb); };

/* ------------------------------------------------------------------ music */
const music = {
  status: 'idle',          // idle | loading | ready | playing | paused | blocked | lost
  player: null, ready: false, wantPlay: false, buffering: false, _api: null, _blockTimer: 0, _readyTimer: 0,
  muted: !!store.get(MUTE_KEY, false),
  volume: Number(store.get(VOL_KEY, 70)) || 70,
  subs: new Set(),
  on(cb) { this.subs.add(cb); return () => this.subs.delete(cb); },
  set(status) { if (this.status === status) return; this.status = status; this.subs.forEach(cb => { try { cb(status); } catch {} }); },
  emit() { this.subs.forEach(cb => { try { cb(this.status); } catch {} }); },
  loadApi() {
    if (this._api) return this._api;
    this._api = new Promise((res, rej) => {
      if (window.YT && window.YT.Player) return res();
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { try { prev && prev(); } catch {} res(); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
      s.onerror = () => rej(new Error('yt api failed'));
      document.head.appendChild(s);
      setTimeout(() => rej(new Error('yt api timeout')), 9000);
    });
    this._api.catch(() => { this._api = null; });            // a failed load can be retried
    return this._api;
  },
  /* Build the enablejsapi iframe ourselves, wait for it to load, then hand it to YT.Player:
     the widget never posts to a blank window, so the console stays clean. Called during the gate.
     A player whose handshake never completes (ad blocker, blocked postMessage) goes to `lost`. */
  async init() {
    if (this.player || this.status === 'loading') return;
    this.set('loading');
    try {
      await this.loadApi();
      let host = $('#yt-host');
      if (!host) { host = document.createElement('div'); host.id = 'yt-host'; host.className = 'yt-host'; host.setAttribute('aria-hidden', 'true'); document.body.appendChild(host); }
      host.innerHTML = '';
      const params = new URLSearchParams({ enablejsapi: 1, autoplay: 0, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0, iv_load_policy: 3, origin: location.origin });
      const iframe = document.createElement('iframe');
      iframe.width = 1; iframe.height = 1; iframe.title = 'Little Voices — Lane 8 (audio)'; iframe.tabIndex = -1;
      iframe.allow = 'autoplay; encrypted-media';
      iframe.src = `https://www.youtube.com/embed/${VIDEO_ID}?${params}`;
      await new Promise((res, rej) => { iframe.onload = res; iframe.onerror = rej; host.appendChild(iframe); setTimeout(() => rej(new Error('embed timeout')), 9000); });
      clearTimeout(this._readyTimer);
      this._readyTimer = setTimeout(() => { if (!this.ready) this.lost(); }, 9000);
      this.player = new YT.Player(iframe, { events: { onReady: () => this.onReady(), onStateChange: e => this.onState(e.data), onError: () => this.lost() } });
    } catch (e) { this.lost(); }
  },
  lost() { clearTimeout(this._readyTimer); clearTimeout(this._blockTimer); if (this.status !== 'playing') this.set('lost'); },
  retry() {                                                  // from `lost`: tear the player down and link again
    try { this.player && this.player.destroy && this.player.destroy(); } catch {}
    this.player = null; this.ready = false; this.buffering = false;
    this.status = 'idle';
    this.wantPlay = true;
    this.init();
  },
  onReady() {
    clearTimeout(this._readyTimer);
    this.ready = true;
    try { this.player.setVolume(this.volume); if (this.muted) this.player.mute(); else this.player.unMute(); } catch {}
    this.set('ready');
    if (this.wantPlay) this.play();
  },
  onState(s) {
    const YTS = window.YT && YT.PlayerState; if (!YTS) return;
    this.buffering = s === YTS.BUFFERING;
    if (s === YTS.PLAYING) { clearTimeout(this._blockTimer); this.wantPlay = false; this.set('playing'); }
    else if (s === YTS.BUFFERING) { if (this.wantPlay && this.status !== 'playing') this.armBlock(); }   // a slow start is not a refusal
    else if (s === YTS.PAUSED) { clock.unsync(); this.set('paused'); }
    else if (s === YTS.ENDED) { try { this.player.seekTo(0, true); this.player.playVideo(); } catch {} }
  },
  armBlock() {
    clearTimeout(this._blockTimer);
    // browsers that refuse audible playback without a gesture never reach PLAYING → TAP FOR SOUND
    this._blockTimer = setTimeout(() => {
      if (!this.wantPlay || this.status === 'playing' || this.status === 'lost') return;
      if (this.buffering) return this.armBlock();
      this.set('blocked');
    }, 1800);
  },
  play() {
    this.wantPlay = true;
    if (this.status === 'lost') return this.retry();
    if (!this.ready) return;                    // onReady will call play() again
    try { this.player.playVideo(); } catch {}
    this.armBlock();
  },
  pause() { this.wantPlay = false; clearTimeout(this._blockTimer); if (this.ready) { try { this.player.pauseVideo(); } catch {} } },
  toggle() { this.status === 'playing' ? this.pause() : this.play(); },
  toggleMute() {
    this.muted = !this.muted; store.set(MUTE_KEY, this.muted);
    if (this.ready) { try { this.muted ? this.player.mute() : this.player.unMute(); } catch {} }
    this.emit();
  },
  setVolume(v) { this.volume = Math.max(0, Math.min(100, v)); store.set(VOL_KEY, this.volume); if (this.ready) { try { this.player.setVolume(this.volume); } catch {} } },
  time() { try { return this.ready ? this.player.getCurrentTime() || 0 : 0; } catch { return 0; } },
  duration() { try { return this.ready ? this.player.getDuration() || 0 : 0; } catch { return 0; } },
};

/* ------------------------------------------------------------------ transport HUD */
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
function mountTransport() {
  const el = $('.transport'); if (!el) return;
  const title = $('.tp-title', el), time = $('.tp-time__v', el) || $('.tp-time', el), status = $('.tp-status', el);
  const mute = $('.tp-mute', el), tap = $('.tp-tap', el);       // no play/pause: the track plays, mute is the one control
  // the live region speaks only for transitions a listener needs: a refusal, a loss, a press
  const labels = { playing: 'Playing Little Voices by Lane 8', paused: 'Paused', blocked: 'Tap for sound', lost: 'Signal lost. Audio offline. Press Retry sound to try again.' };
  let pressed = false;                                       // a transport press asked for this state
  let wasPlaying = false;
  const render = st => {
    el.classList.toggle('is-lost', st === 'lost');
    el.classList.toggle('is-idle', st === 'idle' || st === 'loading');
    el.classList.toggle('is-blocked', st === 'blocked');
    el.dataset.status = st;
    if (mute) { mute.dataset.on = music.muted ? 'true' : 'false'; mute.setAttribute('aria-label', music.muted ? 'Unmute' : 'Mute'); mute.disabled = st === 'lost'; }
    if (tap) { tap.hidden = !(st === 'blocked' || st === 'lost'); setText(tap, st === 'lost' ? 'Retry sound' : 'Tap for sound'); }
    if (st === 'lost') setText(time, '--:--');
    else if (st !== 'playing') setText(time, fmt(music.time()));
    const announce = st === 'blocked' || st === 'lost' || (st === 'paused' && wasPlaying) || (st === 'playing' && pressed);
    setText(status, announce ? labels[st] : '');
    if (st === 'playing' || st === 'paused') pressed = false;
    wasPlaying = st === 'playing';
  };
  music.on(render); render(music.status);
  mute && mute.addEventListener('click', () => music.toggleMute());
  tap && tap.addEventListener('click', () => { pressed = true; music.play(); });
  // a blocked start lifts on the next deliberate gesture anywhere: a press, Enter or Space — not a Tab
  const unblock = () => { if (music.status === 'blocked') music.play(); };
  document.addEventListener('pointerdown', unblock, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') unblock(); });
  setInterval(() => {
    if (music.status === 'playing') { const t = music.time(); clock.sync(t); setText(time, fmt(t)); }
  }, 250);
}

/* HUD height → --top, so main padding never drifts when the HUD wraps to two rows */
function syncTop() {
  const hud = $('.hud'); if (!hud) return;
  const h = hud.offsetHeight; if (h) html.style.setProperty('--top', `${h}px`);
}

/* ------------------------------------------------------------------ cubes (dynamic import: the gate binds first) */
let cubes = null;
let cubesPromise = null;
function mountField(mode) {
  const canvas = $('#cubes');
  if (!canvas || reduced || q.get('nogl') === '1') { html.classList.add('no-webgl'); return Promise.resolve(null); }
  if (cubesPromise) return cubesPromise;
  cubesPromise = import('/assets/js/cubes.js').then(({ mountCubes }) => {
    const c = mountCubes(canvas, {
      count: innerWidth < 640 ? 14 : 28, mode,
      dpr: innerWidth < 640 ? 1.5 : 2,                         // a 3× phone does not need a 2× transparent canvas
      phase: () => clock.beats(),
      top: () => { const h = $('.hud'); return (h && h.offsetHeight) || 56; },   // cubes keep clear of the HUD
    });
    if (!c) throw new Error('no webgl');
    cubes = c; return c;
  }).catch(() => { html.classList.add('no-webgl'); return null; });
  return cubesPromise;
}

/* ------------------------------------------------------------------ gate */
const BEHIND_GATE = '.hud, main#main, .foot';
function mountGate() {
  const gate = $('#gate');
  const mode = pageMode();
  if (q.get('entered') === '1') session.set(ENTERED_KEY, '1');
  const entered = session.get(ENTERED_KEY) === '1' && q.get('gate') !== '1';

  if (!gate || entered) {
    gate && gate.remove();
    html.dataset.entered = '';
    document.body.dataset.state = 'instant';
    mountField(mode);
    requestAnimationFrame(() => { document.body.dataset.state = 'live'; });
    // a reload inside the session: resume audio; if the browser wants a gesture, the transport says TAP FOR SOUND
    music.init(); if (entered) music.play();
    return;
  }

  delete html.dataset.entered;
  document.body.dataset.state = 'gate';
  gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-modal', 'true');
  $$(BEHIND_GATE).forEach(el => { el.inert = true; });      // the page behind the dialog is out of reach
  const btn = $('.gate__cta', gate);
  music.init();                                             // preload the API while the gate is up
  mountField('gate').then(c => { if (c && document.body.dataset.state !== 'gate') { c.setMode(mode); c.pulse(); } });
  gate.tabIndex = -1;
  gate.focus({ preventScroll: true });                      // the dialog takes focus; Tab reaches the one control

  let done = false;
  const enter = () => {
    if (done) return; done = true;
    session.set(ENTERED_KEY, '1');
    music.play();                                           // synchronous inside the gesture when the player is ready
    $$(BEHIND_GATE).forEach(el => { el.inert = false; });
    gate.classList.add('is-leaving');
    document.body.dataset.state = 'live';
    html.dataset.entered = '';
    // focus moves now, before the dialog is hidden, and lands on the wordmark so the next Tab is the nav
    const wm = $('.wordmark') || $('#main'); wm && wm.focus({ preventScroll: true });
    gate.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (cubes) { cubes.setMode(mode); cubes.pulse(); } }, 200);
    setTimeout(() => gate.remove(), reduced ? 0 : 1500);
  };
  gate.addEventListener('click', enter);
  gate.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
    if (e.key === 'Tab') { e.preventDefault(); (btn || gate).focus(); }         // focus trap: one control
  });
}

/* ------------------------------------------------------------------ page scripts + auto-mount */
function runPageScripts(root) {
  $$('script[type="module"][data-page]', root).forEach(s => {
    // a script that arrived through innerHTML is marked "already started" and never runs; a fresh
    // inline module element does, and resolves its imports against the document URL
    const n = document.createElement('script');
    n.type = 'module'; n.dataset.page = '';
    if (s.src) n.src = s.src; else n.textContent = s.textContent;
    s.replaceWith(n);
  });
}
/* components mounted here return { destroy } and are torn down on white:navigate, so a detached
   montage or gallery never keeps its observers and document listeners alive.
   The montage (montage.js + 118 KB gzip of map vectors) is fetched only once its plate is within one
   viewport of the fold: the Trajectory sits ~2 700 px down the home page, and no other page has one. */
const mounted = [];
let nearIo = null;
const nearQueue = new Map();                                 // el → () => import (runs when the plate approaches)
function nearRun(el) {
  const go = nearQueue.get(el); nearQueue.delete(el);
  nearIo && nearIo.unobserve(el);
  go && go();
}
function whenNear(el, run) {
  if (reduced || !('IntersectionObserver' in window)) return run();
  nearIo = nearIo || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) nearRun(en.target); }), { rootMargin: '100% 0px' });
  nearQueue.set(el, run);
  nearIo.observe(el);
  nearSweep();
}
/* belt and braces (as for .reveal): a late IntersectionObserver report never leaves the plate empty — the
   queue is also measured on the next frame and on every scroll */
let nearRaf = 0;
function nearSweep() {
  if (nearRaf || !nearQueue.size) return;
  nearRaf = requestAnimationFrame(() => {
    nearRaf = 0;
    [...nearQueue.keys()].forEach(el => {
      if (!el.isConnected) { nearQueue.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 2 && r.bottom > -innerHeight) nearRun(el);
    });
  });
}
addEventListener('scroll', nearSweep, { passive: true });
addEventListener('resize', nearSweep);
function mountAuto(root = document) {
  const keep = (el, p) => p.then(handle => { if (el.isConnected) mounted.push({ el, handle }); else handle && handle.destroy && handle.destroy(); })
                          .catch(() => { delete el.dataset.mounted; });
  $$('[data-montage]:not([data-mounted])', root).forEach(el => {
    el.dataset.mounted = '';
    whenNear(el, () => { if (el.isConnected) keep(el, import('/assets/js/montage.js').then(m => m.mountMontage(el, { reducedMotion: reduced }))); });
  });
  $$('[data-gallery]:not([data-mounted])', root).forEach(el => {
    el.dataset.mounted = '';
    keep(el, import('/assets/js/gallery.js').then(m => m.mountGallery(el)));
  });
}
function unmountAuto() {
  mounted.splice(0).forEach(({ handle }) => { try { handle && handle.destroy && handle.destroy(); } catch {} });
  nearQueue.clear();
  if (nearIo) { nearIo.disconnect(); nearIo = null; }
}
/* a page whose content mounts after the swap (the gallery manifest, a /post document) is short when the
   scroll is first restored, so the browser clamps it. Re-apply the offset as the document grows, for up
   to two seconds, unless the reader has scrolled in the meantime. */
let settleRaf = 0, settleTarget = null;                     // while settling, the history entry keeps the target, not the clamp
function settleScroll(target) {
  cancelAnimationFrame(settleRaf); settleTarget = null;
  if (!(target > 0)) return;
  const t0 = performance.now();
  let expect = window.scrollY;
  settleTarget = target;
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const done = () => { settleTarget = null; cancelAnimationFrame(settleRaf); inputs.forEach(t => removeEventListener(t, done)); };
  inputs.forEach(t => addEventListener(t, done, { passive: true }));   // the reader moved: theirs wins
  const step = () => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    // a jump the browser made by clamping to a document that shrank mid-mount is not the reader's
    if (Math.abs(window.scrollY - expect) > 2 && Math.abs(window.scrollY - max) > 1) return done();
    const want = Math.min(target, max);
    if (Math.abs(window.scrollY - want) > 1) window.scrollTo({ top: want, behavior: 'instant' });
    expect = window.scrollY;
    if (want < target && performance.now() - t0 < 5000) settleRaf = requestAnimationFrame(step); else done();
  };
  settleRaf = requestAnimationFrame(step);
}
window.addEventListener('white:navigate', () => {
  unmountAuto();
  // the observers hold the old main's nodes: drop them, the next mount recreates them
  if (io) { io.disconnect(); io = null; }
  if (figIo) { figIo.disconnect(); figIo = null; }
});

/* media plates resolve their texture when they enter view (or on tap), not only on hover.
   A looping video gets a pause control (WCAG 2.2.2); under reduced motion it starts paused. */
let figIo = null;
const ICO_PLAY = '<svg class="ico-off" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1.5v7l6-3.5z" fill="currentColor"/></svg>';
const ICO_PAUSE = '<svg class="ico-on" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 1.5h1.6v7H2.5zM5.9 1.5h1.6v7H5.9z" fill="currentColor"/></svg>';
function mountVideoControl(v) {
  const plate = v.parentElement; if (!plate || $('.fig__play', plate)) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'fig__play'; b.innerHTML = ICO_PLAY + ICO_PAUSE;
  const label = v.getAttribute('aria-label') || 'the loop';
  const sync = () => { const on = !v.paused; b.dataset.on = on ? 'true' : 'false'; b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + label); };
  let userPaused = !!reduced;                                // a reader's pause outlasts scrolling
  b.addEventListener('click', () => { if (v.paused) { userPaused = false; v.play().catch(() => {}); } else { userPaused = true; v.pause(); } });
  v.addEventListener('play', sync); v.addEventListener('pause', sync);
  if (reduced) { v.pause(); v.removeAttribute('autoplay'); v.autoplay = false; }
  // a loop below the fold does not decode: pause off-screen, resume in view unless the reader paused it
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(es => es.forEach(en => {
      if (!v.isConnected) { vio.disconnect(); return; }
      if (en.isIntersecting) { if (!userPaused && v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    }), { threshold: .05 });
    vio.observe(plate);
  }
  plate.appendChild(b); sync();
}
function mountMedia(root = document) {
  $$('.fig__plate > video', root).forEach(mountVideoControl);
  const figs = $$('.fig:not(.is-in)', root);
  if (!figs.length) return;
  if (reduced || !('IntersectionObserver' in window)) { figs.forEach(f => f.classList.add('is-in')); return; }
  figIo = figIo || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); figIo.unobserve(en.target); } }), { rootMargin: '0px 0px -20% 0px', threshold: .2 });
  figs.forEach(f => { figIo.observe(f); f.addEventListener('pointerdown', () => f.classList.add('is-in'), { once: true, passive: true }); });
  inViewNow(figs, 'is-in');
}
/* belt and braces: anything inside the viewport is marked on the next frame, and again on scroll/resize,
   so content never waits on a late IntersectionObserver report. If rAF itself is throttled (background
   tab, low-power mode) a 2.5 s timer marks everything pending so no section stays blank. */
const pending = new Map();                                   // el → class
function inViewNow(els, cls) {
  els.forEach(el => pending.set(el, cls));
  sweepPending();
}
let sweepRaf = 0, sweepFail = 0;
function sweepPending() {
  if (sweepRaf || !pending.size) return;
  clearTimeout(sweepFail);
  sweepFail = setTimeout(() => { sweepRaf = 0; pending.forEach((cls, el) => el.classList.add(cls)); pending.clear(); }, 2500);
  sweepRaf = requestAnimationFrame(() => {
    sweepRaf = 0; clearTimeout(sweepFail);
    pending.forEach((cls, el) => {
      if (!el.isConnected) { pending.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * .95 && r.bottom > 0) { el.classList.add(cls); pending.delete(el); }
    });
  });
}
addEventListener('scroll', sweepPending, { passive: true });
addEventListener('resize', sweepPending);

/* ------------------------------------------------------------------ reveal on scroll */
let io = null;
function mountReveal(root = document) {
  const els = $$('.reveal:not(.in)', root);
  if (reduced || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  io = io || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  els.forEach(el => io.observe(el));
  inViewNow(els, 'in');
}

/* ------------------------------------------------------------------ router
   router.path is the pathname+search currently rendered. popstate to the same path is a hash move
   (in-page anchors, footnotes, the principles subnav) and never refetches. Scroll positions ride in
   history.state so Back returns to where the reader was. */
const pathOf = href => { const u = new URL(href, location.href); return u.pathname + u.search; };
const router = {
  ctrl: null, seq: 0, path: pathOf(location.href),
  async go(href, { push = true, scroll = 0 } = {}) {
    const main = $('#main'); if (!main) { location.href = href; return; }
    if (this.ctrl) this.ctrl.abort();                       // newest navigation wins
    const ctrl = this.ctrl = new AbortController();
    const my = ++this.seq;
    const fromY = window.scrollY;                             // where the reader was, read before the swap can clamp it
    try {
      const res = await fetch(href, { headers: { 'X-Requested-With': 'white' }, signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (my !== this.seq) return;
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const next = doc.querySelector('main#main');
      const page = doc.documentElement.dataset.page || (next && next.dataset.page);
      if (!next || !page) throw new Error('not a WHITE page');
      main.classList.add('is-leaving');
      await wait(reduced ? 0 : 280);
      if (my !== this.seq) return;
      // page scripts and mounted components tear down here, after the cross-fade: a plate that collapsed
      // mid-fade would shorten the document and jump the scroll
      window.dispatchEvent(new CustomEvent('white:navigate', { detail: { href, page } }));
      main.innerHTML = next.innerHTML;
      for (const a of [...main.attributes]) if (a.name !== 'id') main.removeAttribute(a.name);
      for (const a of [...next.attributes]) if (a.name !== 'id') main.setAttribute(a.name, a.value);
      main.tabIndex = -1;
      document.title = doc.title;
      html.dataset.page = page;
      // head data follows the document: an element the new page lacks (a canonical on /404, robots on /post) is removed, not kept stale
      const swapMeta = (sel, attr) => {
        const n = doc.querySelector(sel), c = $(sel);
        if (n && c) c.setAttribute(attr, n.getAttribute(attr));
        else if (n) document.head.appendChild(n.cloneNode(true));
        else if (c) c.remove();
      };
      swapMeta('meta[name="description"]', 'content');
      swapMeta('link[rel="canonical"]', 'href');
      swapMeta('meta[name="robots"]', 'content');
      document.head.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());
      doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => { const c = document.createElement('script'); c.type = 'application/ld+json'; c.textContent = s.textContent; document.head.appendChild(c); });
      swapMeta('meta[property="og:title"]', 'content');
      swapMeta('meta[property="og:description"]', 'content');
      swapMeta('meta[property="og:url"]', 'content');
      swapMeta('meta[property="og:image"]', 'content');
      swapMeta('meta[name="twitter:image"]', 'content');
      swapMeta('meta[name="twitter:title"]', 'content');
      swapMeta('meta[name="twitter:description"]', 'content');
      if (push) {
        history.replaceState({ ...(history.state || {}), scroll: fromY }, '', location.href);   // remember where we were
        history.pushState({ page, scroll: 0 }, '', href);
      }
      this.path = pathOf(href);
      cubes && cubes.setMode(modeOf(page));
      window.scrollTo({ top: scroll || 0, behavior: 'instant' });
      main.classList.remove('is-leaving');
      main.classList.add('is-entering');
      setTimeout(() => main.classList.remove('is-entering'), 1000);
      runPageScripts(main);
      markCurrent();
      mountReveal(main); mountMedia(main); mountAuto(main);
      main.focus({ preventScroll: true });
      const hash = new URL(href, location.href).hash;
      if (hash && !scroll) jumpTo(hash);
      else if (scroll) settleScroll(scroll);
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      location.href = href;                                 // a real navigation is the fallback
    } finally { if (this.ctrl === ctrl) this.ctrl = null; }
  },
};
function jumpTo(hash) {
  let t = null; try { t = $(hash) || $(`[name="${hash.slice(1)}"]`); } catch {}
  if (t) t.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}
/* which nav item is "here". A page can say so itself with <main data-nav="/more"> (a /post document says
   which section it belongs to once it has loaded); otherwise the
   path decides, with essays under Writing. Exposed as WHITE.router.markCurrent for pages that learn
   their place late. */
const norm = p => p.replace(/\/index\.html$/, '/').replace(/(.)\/$/, '$1');
function markCurrent() {
  const path = norm(location.pathname);
  const main = $('#main');
  const hint = main && main.dataset.nav ? norm(new URL(main.dataset.nav, location.href).pathname) : null;
  const page = html.dataset.page;
  $$('.nav a').forEach(a => {
    const p = norm(new URL(a.href, location.href).pathname);
    const is = hint ? p === hint
      : p === path || (p !== '/' && path.startsWith(p + '/')) || (p === '/blog' && page === 'essay');
    if (is) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const nav = $('.nav'), cur = $('.nav a[aria-current]');
  if (nav && cur && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: Math.max(0, cur.offsetLeft - 24), behavior: 'auto' });
}
function mountRouter() {
  try { history.scrollRestoration = 'manual'; } catch {}
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noRouter != null || a.getAttribute('rel') === 'external') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.protocol !== location.protocol) return;
    if (/\.(pdf|png|jpe?g|gif|webp|webm|mp4|zip|svg|txt|md|json|xml)$/i.test(url.pathname)) return;
    const strip = p => p.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';   // GitHub Pages serves /blog as /blog/: one path
    const samePage = strip(url.pathname) === strip(location.pathname) && url.search === location.search;
    if (samePage && url.hash) return;                        // hash-only: let the browser jump
    e.preventDefault();
    if (samePage) { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    router.go(url.href);
  });
  window.addEventListener('popstate', () => {
    const st = history.state || {};
    if (pathOf(location.href) === router.path) {             // same document, hash moved: no fetch
      if (location.hash) jumpTo(location.hash); else if (st.scroll != null) window.scrollTo({ top: st.scroll, behavior: 'instant' });
      markCurrent(); return;
    }
    router.go(location.href, { push: false, scroll: st.scroll || 0 });
  });
  // a reload keeps its place: scrollRestoration is manual, so the entry's own offset is re-applied here
  // (once the fonts have settled the document's height), unless the URL names an anchor
  const st0 = history.state || {};
  if (st0.scroll > 0 && !location.hash && html.dataset.entered != null) {
    const back = () => settleScroll(st0.scroll);
    document.fonts && document.fonts.ready ? document.fonts.ready.then(back) : back();
  }
  history.replaceState({ ...(history.state || {}), page: html.dataset.page, scroll: window.scrollY }, '', location.href);
  addEventListener('scroll', () => {                         // keep the current entry's scroll fresh (throttled)
    if (scrollSave) return;
    scrollSave = setTimeout(() => { scrollSave = 0; try { history.replaceState({ ...(history.state || {}), scroll: settleTarget != null ? settleTarget : window.scrollY }, '', location.href); } catch {} }, 250);
  }, { passive: true });
  markCurrent();
}
let scrollSave = 0;

/* ------------------------------------------------------------------ beat loop → --beat + subscribers */
function beatLoop() {
  let lastIdx = -1, lastEnv = '';
  const tick = () => {
    const b = clock.beats();
    const idx = Math.floor(b), p = b - idx;
    const env = Math.pow(.5 + .5 * Math.cos(p * Math.PI * 2), 2.4).toFixed(2);
    if (env !== lastEnv) { lastEnv = env; html.style.setProperty('--beat', env); }
    if (idx !== lastIdx) { lastIdx = idx; beatSubs.forEach(cb => { try { cb(idx); } catch {} }); }
    requestAnimationFrame(tick);
  };
  if (!reduced) requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ boot */
function boot() {
  const main = $('#main'); if (main && !main.hasAttribute('tabindex')) main.tabIndex = -1;
  syncTop();
  mountTransport();
  mountGate();
  mountRouter();
  mountReveal(document);
  mountMedia(document);
  mountAuto(document);
  beatLoop();
  router.markCurrent = markCurrent;
  window.WHITE = { music, router, get cubes() { return cubes; }, bpm: BPM, beat, clock };
  window.dispatchEvent(new Event('white:ready'));
  addEventListener('resize', syncTop);
  addEventListener('load', syncTop);
  document.fonts && document.fonts.ready.then(syncTop);
  if (DEBUG && q.get('debug') === '1') {
    setTimeout(() => {
      const c = $('#cubes'), hud = $('.hud');
      html.dataset.debug = JSON.stringify({ noWebgl: html.classList.contains('no-webgl'), cubes: !!cubes, mode: cubes && cubes.mode, count: cubes && cubes.count, canvas: c && [c.width, c.height], scrollW: html.scrollWidth, innerW: innerWidth, hud: hud && hud.scrollWidth, top: getComputedStyle(html).getPropertyValue('--top').trim(), state: document.body.dataset.state, music: music.status });
    }, 1500);
  }
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
