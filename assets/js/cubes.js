/* cubes.js — the cube field. Frosted acrylic volumes on white; hairline edges; a 125-BPM breath
   that travels through the field as a wave; two cubes drawn twice (ghost edge set). layout() moves the
   two nearest generated targets into the ghost slots, so the ghost is always on a cube close enough to read.
   mountCubes(canvas, opts) → { setMode(name), pulse(), pause(), resume(), destroy(), mode, count, interact } | null
   opts: { count=28, mode='home', phase=()=>beats (float), dpr=2, top=()=>HUD height in px, interact=true, beatMs=480 }
   modes: home writing essay principles gallery more contact void gate

   Formations are sampled with rejection: a candidate is refused when its bounding sphere would meet an
   accepted cube (engineered glass never interpenetrates) or when it would sit over the reading column
   in screen space; after 40 refusals the cube shrinks until it fits. Every candidate that projects
   larger than a speck (~48px) is then kept whole inside the frame: inside the frustum sides, and its top
   edge at least 24px under the HUD. Far specks may leave the frame; nothing that reads as an object is
   sliced by the header or the viewport corner. The rng is seeded by the mode name, so a formation is
   the same on every visit; the layout is redone when the aspect changes enough to matter.
   Materials are per cube (shader uniforms, edge and shadow opacity are per-cube fades): 3 draw calls
   per cube, ~84 at 28. Do not scale the count assuming shared materials.

   Interaction (cubes-interact.js). The cubes can be handled. The canvas has no pointer events of its own,
   so the pointer is read on window and a gesture is "on the field" only when its target is not content
   (links, controls, text, figures, the HUD, the gate); over a cube the cursor is a hand.
   "Content" is an interactive element or figure (a skip list) or the glyphs of the element under the
   pointer, measured geometrically — so the empty half of a block-level heading is live and no text,
   inside a list or not, is ever grabbed.
   · Drag: pointerdown on a cube grabs it; it follows the pointer on the camera-parallel plane through its
     depth and keeps drifting in rotation. Release throws it with the pointer's velocity (the last 160 ms,
     recency-weighted, so a hesitant release still coasts a little): friction .94 per frame, a soft bounce
     off the frame at its depth, then once it has rested 400 ms (or after 2.5 s at most) it eases back to
     its formation slot with the field's own ease, so the field self-heals and the reading column stays
     clear. A moving cube nudges the cubes it passes (soft radial push, radius 1.2 sizes), which spring back.
   · Click (< 6 px, < 300 ms): the cube's fill cycles clear → lime → ice → violet → smoke → clear (one
     cool family: coloured acrylic sheet, not paint; lime is the site's accent). The tint is mixed into
     the frosted shader (uFill/uFillA) under the glass's own lighting, edges darken to match, and the cube
     pulses once (1.06 → 1) over one beat. Fills are in memory for the session and stay with the cube
     through every setMode relayout.
   · Touch: a tap fills; a drag begins after a 250 ms still press (a swipe scrolls the page as usual);
     touchmove is blocked (non-passive) only for the drag's duration.
   · Nothing runs during the gate, while paused (hidden tab) or under the CSS fallback; the canvas never
     takes focus. Under prefers-reduced-motion a released cube returns without inertia.
   API: interact: { enabled, setEnabled(bool), fills() → ['#c8ff00' | null, …] }. With
   window.WHITE_DEBUG_CUBES === true set before mounting, window.__WHITE_CUBES exposes state for a harness. */

import * as THREE from '/assets/vendor/three.module.min.js';
import { attachInteract } from '/assets/js/cubes-interact.js';

const VERT = /* glsl */`
  varying vec3 vN; varying vec3 vW; varying vec3 vL;
  void main () {
    vL = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

/* frosted acrylic: lit base → per-face gradient → AO ramp → narrow fresnel rim tinted cool blue→violet
   (low saturation) with a thin bright edge → alpha rises at the rim; uFade takes the far field to white.
   uFill/uFillA: a clicked cube's tint (raw sRGB numbers — this material has no output transform, so the
   token is written out as is), lit by the same face/gradient/AO term as the glass so a tinted cube keeps
   its three faces, the rim lifted toward the tint, and a slightly higher body alpha so it reads through. */
const FRAG = /* glsl */`
  uniform float uFade; uniform float uBeat; uniform vec3 uFill; uniform float uFillA;
  varying vec3 vN; varying vec3 vW; varying vec3 vL;
  void main () {
    vec3 n = normalize(vN);
    vec3 v = normalize(cameraPosition - vW);
    float ndv = max(dot(n, v), 0.0);
    float edge = 1.0 - ndv;
    float fres = pow(edge, 3.5);
    float band = smoothstep(0.55, 0.92, edge);
    vec3 l = normalize(vec3(0.35, 1.0, 0.55));
    float ndl = dot(n, l) * 0.5 + 0.5;
    vec3 glass = vec3(0.875, 0.906, 0.949);               /* --glass #dfe7f2 */
    vec3 base = mix(glass * 0.90, vec3(0.985, 0.99, 1.0), ndl);
    float grad = 0.5 + vL.y * 0.9 + vL.x * 0.45;          /* light falls across each face */
    base *= mix(0.93, 1.03, clamp(grad, 0.0, 1.0));
    float ao = mix(0.78, 1.0, smoothstep(-0.5, 0.55, vL.y));
    vec3 col = base * ao;
    vec3 lit = col / glass;                               /* the glass's own lighting, per channel */
    vec3 fillCol = mix(uFill, vec3(1.0), 0.06) * lit;     /* tinted acrylic keeps its faces */
    col = mix(col, fillCol, uFillA * 0.82);
    vec3 rim = vec3(0.725, 0.776, 0.847);                 /* --glass-rim #b9c6d8 */
    rim = mix(rim, mix(uFill, vec3(1.0), 0.35), uFillA);  /* the limb of a tinted cube is a lighter tint */
    vec3 blue = vec3(0.66, 0.73, 0.88);                   /* cool blue → faint violet, low saturation */
    vec3 violet = vec3(0.76, 0.70, 0.86);
    vec3 iri = mix(blue, violet, smoothstep(-0.7, 0.7, n.x));
    rim = mix(rim, iri, 0.35 * band);                     /* the tint lives in the limb band only */
    col = mix(col, rim, min(fres, 0.55) * 0.8);           /* a grazing face never turns lavender */
    col += band * vec3(0.05, 0.06, 0.09);                 /* the bright hairline at the limb */
    col += fres * uBeat * 0.04;
    float a = uFade * (0.50 + fres * 0.40 + band * 0.08);
    a = mix(a, uFade * (0.56 + fres * 0.34 + band * 0.08), uFillA);
    gl_FragColor = vec4(col, a);
  }`;

const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const FOV = 32;
const FOV_T = Math.tan((FOV / 2) * Math.PI / 180);

function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ formations
   ctx: { narrow, aspect, camZ, halfW(z), halfH(z), sw(z), px(z), viewW, viewH, topPx() }  — sw(z) maps world x at
   depth z to the z=0 plane (screen space); halfW/halfH are the frustum half-extents at depth z; px(z) is
   screen pixels per world unit at depth z; topPx() is the HUD height.
   Each formation is { fixed(ctx, r) → [targets], gen(i, r, ctx) → candidate }. A target is
   { x, y, z, s, wrap } — wrap:false means the cube scrolls away with the page instead of re-entering
   (used where a re-entry could land behind text). column: screen-space x the reading column ends at. */
const NONE = { x: 0, y: 0, z: -14, s: 0 };
const SCROLL_K = .0021;                                           // world units per scrolled px — slower than the page
/* a cube right of the reading column: x in screen space between the column's edge and the frustum side */
function rightOf(column, s, z, r, ctx) {
  const sw = ctx.sw(z);
  const x0 = column + s * sw * .95, x1 = ctx.halfW(0) * .96 - s * sw * .95;
  return (x1 > x0 ? x0 + r() * (x1 - x0) : x1) / sw;
}
/* phones (any page with a head at the top): far specks spread across, skipping the band the title and lede occupy at first paint */
function phoneSpecks(i, r, ctx, band = [.1, .7]) {
  const z = -10 + r() * 6, s = .22 + r() * r() * .4;
  const hw = ctx.halfW(z) * .9, hh = ctx.halfH(z);
  const u = r();
  const top = 1 - band[0] * 2, bottom = 1 - band[1] * 2;          // frame fractions → world y at this depth
  const y = u < .3 ? hh * top + (u / .3) * hh * (1 - top) : -hh + ((u - .3) / .7) * (hh * bottom + hh);
  return { x: -hw + r() * 2 * hw, y, z, s };
}
const FORMATIONS = {
  gate: {
    fixed: () => [{ x: 0, y: .35, z: 4.5, s: 1.15 }],
    gen: () => ({ x: 0, y: .35, z: 4.5, s: 0 }),
  },
  home: {
    column: 1.4,
    fixed(ctx) {
      // the gate cube settles right of the name; on phones it is the one full cube in the upper third
      if (ctx.narrow) return [{ x: .85, y: 3.0, z: .8, s: .85, wrap: false }];
      const s = 1.1, sw = ctx.sw(1.0);
      return [{ x: Math.min(3.9, (ctx.halfW(0) * .96 - s * sw * .95) / sw), y: .6, z: 1.0, s }];
    },
    gen(i, r, ctx) {
      if (ctx.narrow) {
        if (i <= 2) {                               // two more near cubes, above the name, fully inside
          const z = -2 + r() * 2, s = .32 + r() * .28;
          const hw = ctx.halfW(z) - s * .95 - .1;
          // the name's cap line is just under the frame's centre: the cube's bottom (with drift) stays ≥ 24px above it
          const y0 = .65 + s * .9;
          return { x: -hw + r() * 2 * hw, y: y0 + r() * 2.4, z, s, wrap: false };
        }
        const z = -10 + r() * 6, s = .22 + r() * r() * .4;
        const hw = ctx.halfW(z) * .9, hh = ctx.halfH(z);
        // the far specks skip the band the name and lede occupy at first paint (52%–82% of the frame)
        const u = r();
        const y = u < .25 ? -hh + (u / .25) * .35 * hh : .12 * hh + ((u - .25) / .75) * .88 * hh;
        return { x: -hw + r() * 2 * hw, y, z, s };
      }
      const near = i === 1 || r() < .32;
      const z = near ? -2 + r() * 3.5 : -10 + r() * 8;
      const s = near ? .45 + r() * .55 : .26 + r() * r() * .9;
      // x lives right of the reading column in screen space, and inside the frustum with the cube whole
      const x = rightOf(this.column, s, z, r, ctx);
      const hh = ctx.halfH(z);
      const y = near ? -(hh * .86 - s) + r() * 2 * (hh * .86 - s) : -hh + r() * 2 * hh;
      return { x, y, z, s };
    },
  },
  writing: {
    column: 1.2,
    gen(i, r, ctx) {
      // the index is a left-aligned list; a loose column of cubes recedes on the right
      const z = -8 + r() * 8, s = .35 + r() * .6, sw = ctx.sw(z);
      const x0 = Math.max(3.2, this.column + s * sw), x1 = ctx.halfW(0) - s * sw;
      return { x: (x0 + r() * Math.max(0, x1 - x0)) / sw, y: -6 + r() * 12, z, s };
    },
  },
  essay: {
    gen(i, r, ctx) {
      if (ctx.narrow) {
        // a phone: the column is the whole width, so the field lives below the essay (four that rise into the
        // last screen, behind the footer's own white). Nothing beside or above the prose, ever.
        if (i >= 4) return { ...NONE };
        const z = -2.5 + r() * 1.5, s = .3 + r() * .12;                  // near enough to read as glass, still under the speck size so fit() never pulls them into the column
        const hw = ctx.halfW(z) * .88, hh = ctx.halfH(z);
        const x = -hw + r() * 2 * hw;
        return { x, y: -hh * .55 - ctx.pageLift() + r() * hh * .5 - .5, z, s, wrap: false };
      }
      // 66ch column in the centre: nothing inside |x| < 6, everything deep and small
      const side = i % 2 ? 1 : -1;
      return { x: side * (6.2 + r() * 3.5), y: -7 + r() * 14, z: -9 + r() * 5, s: .3 + r() * .55 };
    },
  },
  principles: {
    column: 1.6,
    gen(i, r, ctx) {
      // sticky nav left, column centre-left: field to the right, an arc — and never inside the column's screen edge
      const a = (i / 28) * Math.PI * 2 + (r() - .5) * .3;
      const z = -6 + Math.sin(a * 2) * 2.5, s = .4 + r() * .4, sw = ctx.sw(z);
      const x = Math.max(6.4 + Math.cos(a) * 1.6 + r() * 1.2, (this.column + s * sw) / sw);
      return { x, y: Math.sin(a) * 6, z, s };
    },
  },
  gallery: {
    column: 1.4,
    gen(i, r, ctx) {
      // photos are the content: the field sits far back, sparse, spread across — except behind the head
      // (title, lede, album pills: the top ~470px of the column at first paint), which stays clear
      const z = -13 + r() * 4, s = i < 17 ? .35 + r() * .5 : 0;
      const hh = ctx.halfH(z), hw = ctx.halfW(z) * .95;
      const y = -hh + r() * 2 * hh;
      const headEnd = hh - (ctx.topPx() + 470) / ctx.px(z);
      const x = y + s * .9 > headEnd ? rightOf(this.column, s, z, r, ctx) : -hw + r() * 2 * hw;
      return { x, y, z, s };
    },
  },
  more: {
    column: 1.4,
    gen(i, r, ctx) {
      if (ctx.narrow) return phoneSpecks(i, r, ctx);
      // a loose field right of the head column, the same depth spread as home; nothing behind the title or lede
      const near = r() < .3;
      const z = near ? -3 + r() * 2.5 : -10 + r() * 7;
      const s = near ? .4 + r() * .4 : .3 + r() * .5;
      const hh = ctx.halfH(z);
      return { x: rightOf(this.column, s, z, r, ctx), y: -hh * .9 + r() * 1.8 * hh, z, s };
    },
  },
  contact: {
    gen(i, r) {
      // a cluster right of the 720px list: Gaussian, spread wide enough that the glass never has to shrink to fit
      const g = () => r() + r() + r() - 1.5;
      return { x: 5.5 + g() * 2.4, y: .5 + g() * 2.8, z: -3 + g() * 2.4, s: .3 + r() * .5 };
    },
  },
  void: {
    fixed: () => [{ x: .15, y: .2, z: 2, s: 1.4 }],           // the rotation carries the visual mass left; the slot leans right
    gen: () => ({ ...NONE }),
  },
};

/* two cubes may not meet: bounding spheres (radius .87 s) plus the drift they will add later */
function clear(c, placed, ctx) {
  if (c.s <= 0) return true;
  for (const o of placed) {
    if (o.s <= 0) continue;
    const dx = c.x - o.x, dy = c.y - o.y, dz = c.z - o.z;
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < .9 * (c.s + o.s) + .5) return false;
    if (Math.abs(dz) < 2) {                        // similar depth: also keep them apart on screen
      const a = ctx.sw(c.z), b = ctx.sw(o.z);
      const px = c.x * a - o.x * b, py = c.y * a - o.y * b;
      if (Math.sqrt(px * px + py * py) < .75 * (c.s * a + o.s * b) + .25) return false;
    }
  }
  return true;
}
/* anything that reads as an object stays whole in the frame: clamped inside the frustum sides, its top
   edge ≥ 24px under the HUD, its bottom inside the viewport. The margin covers the cube's bounding
   radius plus the drift it will add later. Specks under ~48px on screen may leave the frame. */
const SPECK_PX = 48;
const DISSOLVE_PX = 12;   // the HUD dissolve applies to anything larger than dust, so the 24px-under-the-HUD rule holds at every size
function fit(c, ctx) {
  if (c.s <= 0) return c;
  const px = ctx.px(c.z);
  if (c.s * 1.73 * px < SPECK_PX) return c;
  const m = c.s * .87 + .45;
  const hw = ctx.halfW(c.z) * .98 - m;
  c.x = clamp(c.x, -hw, hw);
  const hh = ctx.halfH(c.z);
  const top = hh - (ctx.topPx() + 24) / px - m;
  const bottom = -hh * .98 + m;
  c.y = clamp(c.y, Math.min(bottom, top), top);
  return c;
}
const GHOST_SLOTS = 2;
function layout(name, n, r, ctx) {
  const f = FORMATIONS[name] || FORMATIONS.home;
  const out = (f.fixed ? f.fixed(ctx, r) : []).slice(0, n).map(c => fit(c, ctx));
  const nFixed = out.length;
  for (let i = out.length; i < n; i++) {
    let pick = null;
    for (let k = 0; k < 40; k++) {
      const c = fit(f.gen(i, r, ctx), ctx);
      if (clear(c, out, ctx)) { pick = c; break; }
      if (!pick || c.s < pick.s) pick = c;
    }
    for (let k = 0; k < 10 && !clear(pick, out, ctx); k++) pick.s *= .82;
    if (!clear(pick, out, ctx)) pick.s = 0;
    out.push(pick);
  }
  // the ghost slots (indices 0 and 1) take the nearest generated cubes, so a redrawn edge is never on a faded speck
  for (let k = nFixed; k < GHOST_SLOTS && k < out.length; k++) {
    let best = k;
    for (let j = k + 1; j < out.length; j++) if (out[j].s > 0 && (out[best].s <= 0 || out[j].z > out[best].z)) best = j;
    if (best !== k) [out[k], out[best]] = [out[best], out[k]];
  }
  return out;
}

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 2, 64, 64, 60);
  grd.addColorStop(0, 'rgba(11,13,16,.5)');
  grd.addColorStop(.5, 'rgba(11,13,16,.16)');
  grd.addColorStop(1, 'rgba(11,13,16,0)');
  g.save(); g.scale(1, .5); g.fillStyle = grd; g.fillRect(0, 0, 128, 128); g.restore();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountCubes(canvas, opts = {}) {
  const count = Math.min(Math.max(1, opts.count || 28), 80);
  const phase = opts.phase || (() => performance.now() / 480);
  // probe for a context first (on a throwaway canvas, released at once): three.js logs a stack of errors when it
  // cannot create one, and a visitor with WebGL off should get the CSS cubes in silence
  try {
    const probe = document.createElement('canvas');
    const g = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) || probe.getContext('webgl');
    if (!g) return null;
    const lose = g.getExtension('WEBGL_lose_context'); lose && lose.loseContext();
  } catch (e) { return null; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: true });
  } catch (e) { return null; }
  const gl = renderer.getContext();
  if (!gl) { try { renderer.dispose(); } catch {} return null; }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.dpr || 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, .1, 80);
  camera.position.set(0, 0, 14);

  const box = new THREE.BoxGeometry(1, 1, 1);
  const edgesGeo = new THREE.EdgesGeometry(box);
  const shadowTex = shadowTexture();
  const r = rng(hash('field'));
  const GHOSTS = count > 12 ? [0, 1] : [0];
  const ghostColors = [0x7f98c2, 0x9a8ac0];              // cool blue, faint violet — a redrawn line, not a lens

  const cubes = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      uniforms: { uFade: { value: 1 }, uBeat: { value: 0 }, uFill: { value: new THREE.Color().setHex(0xdfe7f2, THREE.LinearSRGBColorSpace) }, uFillA: { value: 0 } },
    });
    const mesh = new THREE.Mesh(box, mat);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0b0d10, transparent: true, opacity: .3 });
    const edges = new THREE.LineSegments(edgesGeo, lineMat);
    const g = new THREE.Group(); g.add(mesh); g.add(edges);
    let ghost = null;
    const gi = GHOSTS.indexOf(i);
    if (gi >= 0) {
      ghost = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: ghostColors[gi % ghostColors.length], transparent: true, opacity: .42 }));
      ghost.position.set(.06, -.045, .04); ghost.scale.setScalar(1.012);   // a redrawn drafting line, legible at 1x
      g.add(ghost);
    }
    const shMat = new THREE.SpriteMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false });
    const shadow = new THREE.Sprite(shMat);
    scene.add(g); scene.add(shadow);
    cubes.push({
      g, mat, lineMat, ghost, shadow, shMat,
      from: { x: 0, y: .35, z: 4.5, s: 0 }, to: { x: 0, y: .35, z: 4.5, s: 0 }, cur: { x: 0, y: .35, z: 4.5, s: 0 },
      t0: 0, dur: 2400, delay: i * 35,
      rot: new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize(), rotSpeed: (.025 + r() * .045) * (r() > .5 ? 1 : -1),
      seed: r() * 100, drift: .14 + r() * .2,
    });
    g.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
  }

  const topPx = typeof opts.top === 'function' ? opts.top : () => (Number(opts.top) || 56);
  let viewW = innerWidth, viewH = innerHeight;                    // the canvas's CSS size (not innerWidth: classic scrollbars)
  const ctx = {
    get narrow() { return camera.aspect < .8; },
    get aspect() { return camera.aspect; },
    get camZ() { return camera.position.z; },
    halfW(z) { return (camera.position.z - z) * FOV_T * camera.aspect; },
    halfH(z) { return (camera.position.z - z) * FOV_T; },
    sw(z) { return camera.position.z / (camera.position.z - z); },
    px(z) { return (viewH / 2) / ((camera.position.z - z) * FOV_T); },
    get viewW() { return viewW; }, get viewH() { return viewH; },
    topPx,
    pageLift() { return Math.max(0, (document.documentElement.scrollHeight - viewH)) * SCROLL_K; },   // the lift at the page's end
  };
  let mode = null, laidAspect = 0, laidZ = 0;
  let running = false;
  // the hands: drag, throw, click-to-fill (see the header). Off while the gate is up or the loop is paused.
  const ix = attachInteract({ camera, cubes, ctx, live: () => running && mode !== 'gate', enabled: opts.interact !== false, beatMs: opts.beatMs || 480 });
  function setMode(name) {
    // seeded by the mode name; an essay adds its path, so two essays own two arrangements and an essay → essay route still moves the field
    const seed = name === 'essay' ? name + location.pathname.replace(/\/(index\.html)?$/, '') : name;
    const targets = layout(name, count, rng(hash(seed)), ctx);
    const now = performance.now();
    cubes.forEach((c, i) => { c.from = { ...c.cur }; c.to = targets[i] || { ...NONE }; c.t0 = now; });
    mode = name; laidAspect = camera.aspect; laidZ = camera.position.z;
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;     // touch scrolling is not parallax
    mouse.tx = (e.clientX / viewW - .5) * 2; mouse.ty = (e.clientY / viewH - .5) * 2;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  let scrollY = window.scrollY || 0;
  const onScroll = () => { scrollY = window.scrollY || 0; };
  window.addEventListener('scroll', onScroll, { passive: true });

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    viewW = w; viewH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    camera.position.z = camera.aspect < .8 ? 19 : camera.aspect < 1.2 ? 16 : 14;
  }
  // the clamps and the reading-column exclusion are screen-space: relay (debounced) when the aspect
  // moves more than 10% or the camera changes distance band, not only when the phone flag flips
  let resizeT = 0;
  const onResize = () => {
    resize();
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (!mode) return;
      if (camera.position.z !== laidZ || Math.abs(camera.aspect - laidAspect) / laidAspect > .1) setMode(mode);
    }, 250);
  };
  window.addEventListener('resize', onResize);
  resize();

  let raf = 0, last = performance.now(), burst = 0, lostCtx = false;
  const P = new THREE.Vector3();                                    // this frame's drawn position (scratch)

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;

    const beats = phase();
    burst = Math.max(0, burst - dt * 1.4);

    mouse.x = lerp(mouse.x, mouse.tx, .03);
    mouse.y = lerp(mouse.y, mouse.ty, .03);
    camera.position.x = mouse.x * .6;
    camera.position.y = -mouse.y * .4;
    camera.lookAt(mouse.x * .2, -mouse.y * .12, 0);

    const ts = now * .001;
    const camZ = camera.position.z;
    const lift = scrollY * SCROLL_K;
    ix.begin(now);                                                  // one raycast per frame at most; drag follows the pointer
    for (const c of cubes) {
      const k = easeIO(clamp((now - c.t0 - c.delay) / c.dur, 0, 1));
      c.cur.x = lerp(c.from.x, c.to.x, k);
      c.cur.y = lerp(c.from.y, c.to.y, k);
      c.cur.z = lerp(c.from.z, c.to.z, k);
      c.cur.s = lerp(c.from.s, c.to.s, k);

      const dx = Math.sin(ts * .19 + c.seed) * c.drift;
      const dy = Math.cos(ts * .15 + c.seed * 1.3) * c.drift * .8;
      const dz = Math.sin(ts * .11 + c.seed * .7) * c.drift * .5;

      // travelling wave: the breath's phase is offset by position, so it moves through the field
      const pp = beats - (c.cur.x * .06 + c.cur.y * .04);
      const lp = pp - Math.floor(pp);
      const env = Math.pow(.5 + .5 * Math.cos(lp * Math.PI * 2), 2.2);
      let s = c.cur.s * (1 + .03 * env + .14 * burst);
      let visible = s > .015;

      // the field persists down the page: wrap each cube's y into the visible band at its depth.
      // wrap:false cubes scroll away with the page instead (they would otherwise re-enter behind text)
      // and stop drawing once they have left the frustum. A cube in the hand (or thrown) is drawn wherever it is.
      const z = c.cur.z + dz;
      const hh = (camZ - z) * FOV_T;
      const R = hh * 1.25 + s;
      let y = c.cur.y + dy + lift;
      if (mode !== 'gate' && c.to.wrap !== false) y = ((y + R) % (2 * R) + 2 * R) % (2 * R) - R;
      else if (Math.abs(y) > R && !c.ix.hold) visible = false;
      c.g.visible = visible;
      if (!visible) { c.shadow.visible = false; continue; }

      // the formation position is where the cube belongs; the interaction may move it (drag, throw, heal,
      // nudge) and pulse its scale on fill
      P.set(c.cur.x + dx, y, z);
      s = ix.place(c, P, s, now, dt);
      c.g.position.copy(P);
      c.g.scale.setScalar(s);
      c.g.rotateOnAxis(c.rot, c.rotSpeed * dt);

      const dist = camera.position.distanceTo(P);
      let fade = clamp(1 - (dist - 11) / 20, .06, 1);             // distance fade to white
      // nothing that reads as an object is ever sliced by the HUD: as scroll parallax (or a throw) carries a cube
      // toward the header band it dissolves, gone before its top edge reaches the line 24px under the HUD
      if (mode !== 'gate') {
        const pxz = ctx.px(P.z);
        if (s * 1.73 * pxz >= DISSOLVE_PX) {                          // every visible cube, specks included; only dust is exempt
          const yHud = (camZ - P.z) * FOV_T - (topPx() + 24) / pxz + camera.position.y;
          fade *= clamp((yHud - (P.y + s * .87)) / (s * .6), 0, 1);
        }
      }
      const fillA = c.ix.fillA;
      c.mat.uniforms.uFade.value = fade;
      c.mat.uniforms.uBeat.value = env;
      c.lineMat.opacity = (.28 + .06 * env) * fade * (1 + .5 * fillA);
      if (c.ghost) c.ghost.material.opacity = .42 * fade;
      // a contact shadow needs a floor: it exists only in the lower third of the frame, follows the
      // cube's own visibility squared, and never darker than .08 — nothing floats under mid-air glass
      const hhP = (camZ - P.z) * FOV_T;
      const floorK = clamp((-(P.y / hhP) - .15) / .55, 0, 1);
      const sh = .08 * fade * fade * floorK * clamp(1 - Math.abs(dy) * .4, .5, 1);
      c.shadow.visible = sh > .004;
      if (c.shadow.visible) {
        c.shadow.position.set(P.x, P.y - s * .82 - .1, P.z);
        c.shadow.scale.set(s * 2.6, s * 1.1, 1);
        c.shMat.opacity = sh;
      }
    }
    ix.end(now, dt);                                                // a moving cube pushes the cubes it passes
    renderer.render(scene, camera);
  }

  function resume() { if (running || lostCtx) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function pause() { running = false; cancelAnimationFrame(raf); }
  const onVis = () => document.hidden ? pause() : resume();
  document.addEventListener('visibilitychange', onVis);
  // mobile Safari drops the context on backgrounding: stop drawing, pick up again when it comes back
  const onLost = e => { e.preventDefault(); lostCtx = true; pause(); };
  const onRestored = () => { lostCtx = false; if (!document.hidden) resume(); };
  canvas.addEventListener('webglcontextlost', onLost, false);
  canvas.addEventListener('webglcontextrestored', onRestored, false);

  setMode(opts.mode || 'home');
  cubes.forEach(c => { c.cur = { ...c.to }; c.from = { ...c.to }; });   // start settled
  resume();

  return {
    setMode,
    pulse() { burst = 1; },
    pause, resume,
    get mode() { return mode; },
    get count() { return count; },
    interact: ix.api,
    destroy() {
      pause();
      ix.destroy();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize); clearTimeout(resizeT);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      cubes.forEach(c => { c.mat.dispose(); c.lineMat.dispose(); c.shMat.dispose(); if (c.ghost) c.ghost.material.dispose(); });
      box.dispose(); edgesGeo.dispose(); shadowTex.dispose(); renderer.dispose();
      try { renderer.forceContextLoss(); } catch {}
    },
  };
}
