/* cubes-interact.js — pointer interaction for the cube field. Imported by cubes.js; not a page module.
   attachInteract({ camera, cubes, ctx, live, enabled, beatMs }) → { begin, place, end, fills, api, destroy }

   The canvas sits behind the page with no pointer events of its own, so the pointer is read on window
   and a gesture counts as "on the field" unless it is on something that must keep it: an interactive
   element or a figure (the SKIP list), or the glyphs of the element under the pointer. The glyph test is
   geometric — the target's own text nodes, measured with a Range, plus a 4px halo — so text is never
   swallowed anywhere, and the empty half of a block-level heading or a section-head row is live.
   Hit-testing is an exact ray/box test in each cube's local frame — no per-frame allocation, no three.js
   intersection records — and runs at most once per animation frame.

   Per cube: c.ix = { hold, pos, vel, off, off0, nvel, t, rest, t0, fill, fillA, fillTo, col, colTo, pulseT0, px, s }
     hold  0 in formation · 1 dragged (pos follows the pointer on the camera-parallel plane through the
           cube) · 2 coasting (pos += vel; friction .94/frame at 60 fps; soft bounce off the frame at its
           depth; heals once it has rested 400 ms or after 2.5 s) · 3 healing (drawn = formation + off, off
           eases to zero over 2.4 s with the field's own ease) · 4 nudged (a passing cube pushed it; a
           critically damped spring brings off back)
     fill  palette index; 0 is clear. col/colTo are the shader uniform (mutated in place) and its target.
   Colour: the frosted shader is a raw ShaderMaterial with no output transform, so uFill holds the token's
   sRGB numbers as they are (setHex with LinearSRGBColorSpace stores them untransformed); the edge
   LineBasicMaterial IS colour-managed, so its tint is converted to linear before the lerp from ink.
   Positions in .pos/.off are drawn (world) positions, so scroll lift and wrap are already inside them. */

import * as THREE from '/assets/vendor/three.module.min.js';

// clear · lime (the site's one accent) · ice · violet · smoke — one cool family, coloured acrylic sheet, not paint
export const PALETTE = [null, 0xc8ff00, 0xa9d8f4, 0xc7bcf2, 0x9ca5b3];
const SKIP = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable], img, video, svg, figure, table, pre, .fig, .montage, [data-montage], .gallery, [data-gallery], .lightbox, .transport, .nav, .hud, #gate';
const TEXT_PAD = 4;                                            // px halo around a glyph box that still counts as text

const HOLD = { none: 0, drag: 1, coast: 2, heal: 3, nudge: 4 };
const CLICK_PX = 6, CLICK_MS = 300, PRESS_MS = 250;
const COAST_S = 2.5, REST_S = .4, REST_V = .15, HEAL_MS = 2400, FRICTION = .94, BOUNCE = .55, MAX_SPEED = 36;
const MIN_PX = 14;                                             // a speck this small is not a handle
const NUDGE_R = 1.2, NUDGE_K = 1.8, NUDGE_MAX = 3, SPRING_K = 12, SPRING_D = 7;
const SAMPLES = 16, VEL_WINDOW = 160, VEL_TAU = 60;            // ms of pointer history the throw reads; recency weight e^(-age/tau)

const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const LIN = THREE.LinearSRGBColorSpace;
const INK = new THREE.Color(0x0b0d10);                         // managed: linear, for the edge material
const GLASS = new THREE.Color().setHex(0xdfe7f2, LIN);        // raw sRGB numbers, for the shader
const UNIT = new THREE.Box3(new THREE.Vector3(-.5, -.5, -.5), new THREE.Vector3(.5, .5, .5));
const _ndc = new THREE.Vector2();
const _ray = new THREE.Ray();
const _inv = new THREE.Matrix4();
const _v = new THREE.Vector3(), _hit = new THREE.Vector3(), _dir = new THREE.Vector3();
const _edge = new THREE.Color();
let _range = null;

/* is (x, y) on the glyphs of el's own text? Block containers stretch past their words (a display:block
   span in the hero, a section-head row), so the element box is not the answer; the text boxes are. */
function overText(el, x, y) {
  for (let n = el.firstChild; n; n = n.nextSibling) {
    if (n.nodeType !== 3 || !/\S/.test(n.data)) continue;
    if (!_range) _range = document.createRange();
    _range.selectNodeContents(n);
    const rects = _range.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r.width > 0 && x >= r.left - TEXT_PAD && x <= r.right + TEXT_PAD && y >= r.top - TEXT_PAD && y <= r.bottom + TEXT_PAD) return true;
    }
  }
  return false;
}
function fieldAt(t, x, y) {
  if (!t || t.nodeType !== 1) return true;
  if (t.closest(SKIP)) return false;
  return !overText(t, x, y);
}

export function attachInteract({ camera, cubes, ctx, live, enabled = true, beatMs = 480 }) {
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const grab = new THREE.Vector3();                            // hit point − cube centre, kept through the drag
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  for (const c of cubes) {
    c.ix = {
      hold: HOLD.none, pos: new THREE.Vector3(), vel: new THREE.Vector3(), off: new THREE.Vector3(), off0: new THREE.Vector3(), nvel: new THREE.Vector3(),
      t: 0, rest: 0, t0: 0, fill: 0, fillA: 0, fillTo: 0, col: new THREE.Color().copy(GLASS), colTo: new THREE.Color().copy(GLASS), pulseT0: -1e9, px: 0, s: 0,
    };
    c.mat.uniforms.uFill.value = c.ix.col;
  }

  /* ---------------------------------------------------------------- pointer */
  const P = { x: 0, y: 0, on: false, dirty: false, id: -1, type: 'mouse', down: false, downX: 0, downY: 0, downT: 0, moved: false, dragging: false, cube: null, hover: null };
  const ring = Array.from({ length: SAMPLES }, () => ({ t: 0, x: 0, y: 0, z: 0 }));
  let ringN = 0, ringI = 0;
  let pressTimer = 0, cursor = '', selectWas = null;
  const isLive = () => enabled && live();
  const onField = e => fieldAt(e.target, e.clientX, e.clientY);
  const setCursor = v => { if (cursor === v) return; cursor = v; document.documentElement.style.cursor = v; };
  // selection is off only while a mouse/pen drag is live (cancelling pointerdown covers most engines; this covers the rest)
  const holdSelection = on => {
    const st = document.documentElement.style;
    if (on) { if (selectWas === null) { selectWas = st.userSelect || ''; st.userSelect = 'none'; st.webkitUserSelect = 'none'; } }
    else if (selectWas !== null) { st.userSelect = selectWas; st.webkitUserSelect = selectWas; selectWas = null; }
  };

  function pushSample(now, p) { const s = ring[ringI]; s.t = now; s.x = p.x; s.y = p.y; s.z = p.z; ringI = (ringI + 1) % SAMPLES; ringN = Math.min(ringN + 1, SAMPLES); }
  /* throw velocity: segment velocities over the last VEL_WINDOW ms, weighted by duration and recency, so a
     short hesitation before release damps the throw instead of cancelling it; at least three frames are read */
  function sampledVelocity(now, out) {
    out.set(0, 0, 0);
    if (ringN < 2) return out;
    let wsum = 0;
    for (let k = 1; k < ringN; k++) {
      const b = ring[(ringI - k + SAMPLES) % SAMPLES], a = ring[(ringI - k - 1 + SAMPLES) % SAMPLES];
      const age = now - b.t;
      if (age > VEL_WINDOW && k > 3) break;
      const dt = (b.t - a.t) / 1000;
      if (dt < 1e-4) continue;
      const w = dt * Math.exp(-Math.max(0, age) / VEL_TAU);
      out.x += w * (b.x - a.x) / dt; out.y += w * (b.y - a.y) / dt; out.z += w * (b.z - a.z) / dt;
      wsum += w;
    }
    if (wsum > 0) out.multiplyScalar(1 / wsum);
    return out;
  }

  function setRay(x, y) {
    _ndc.set((x / ctx.viewW) * 2 - 1, -(y / ctx.viewH) * 2 + 1);   // the canvas's own size: classic scrollbars do not skew the ray
    camera.updateMatrixWorld();
    raycaster.setFromCamera(_ndc, camera);
  }
  /* nearest cube under the ray: the ray is moved into each cube's frame and tested against the unit box */
  function hitTest() {
    let best = null, bestD = Infinity;
    for (const c of cubes) {
      if (!c.g.visible || c.ix.px < MIN_PX) continue;
      _inv.copy(c.g.matrixWorld).invert();
      _ray.copy(raycaster.ray).applyMatrix4(_inv);
      if (!_ray.intersectBox(UNIT, _v)) continue;
      _v.applyMatrix4(c.g.matrixWorld);
      const d = _v.distanceToSquared(raycaster.ray.origin);
      if (d < bestD) { bestD = d; best = c; _hit.copy(_v); }
    }
    return best;
  }

  function beginDrag() {
    pressTimer = 0;
    const c = P.cube; if (!c || !P.down) return;
    P.dragging = true;
    const I = c.ix;
    I.hold = HOLD.drag; I.vel.set(0, 0, 0); I.nvel.set(0, 0, 0); I.off.set(0, 0, 0); I.off0.set(0, 0, 0); I.rest = 0;
    I.pos.copy(c.g.position);
    camera.getWorldDirection(_dir);
    plane.setFromNormalAndCoplanarPoint(_dir, I.pos);
    grab.copy(_hit).sub(I.pos);
    ringN = 0; ringI = 0;
    if (P.type === 'touch') window.addEventListener('touchmove', blockScroll, { passive: false });
    else holdSelection(true);
    setCursor('grabbing');
  }
  const blockScroll = e => { if (P.dragging) e.preventDefault(); };

  function release(throwIt) {
    const c = P.cube;
    if (c && P.dragging) {
      const I = c.ix, now = performance.now();
      // the release itself is the last sample, at its own time and place: samples otherwise land once per
      // frame, and a slow frame must not turn a short hesitation into a dead throw (or hide one)
      setRay(P.x, P.y);
      if (raycaster.ray.intersectPlane(plane, _v)) I.pos.copy(_v).sub(grab);
      pushSample(now, I.pos);
      sampledVelocity(now, I.vel);
      const sp = I.vel.length();
      if (sp > MAX_SPEED) I.vel.multiplyScalar(MAX_SPEED / sp);
      I.hold = HOLD.coast; I.rest = 0;
      if (!throwIt || reduced.matches || sp < .05) { I.vel.set(0, 0, 0); I.t = COAST_S; }   // heals on the next frame
      else I.t = 0;
    }
    window.removeEventListener('touchmove', blockScroll);
    holdSelection(false);
    clearTimeout(pressTimer); pressTimer = 0;
    P.down = false; P.dragging = false; P.cube = null; P.id = -1; P.dirty = true;
    setCursor(P.hover ? 'grab' : '');
  }

  const onDown = e => {
    if (!isLive() || P.down) return;
    if (e.pointerType !== 'touch' && e.button !== 0) return;
    if (!onField(e)) return;
    setRay(e.clientX, e.clientY);
    const c = hitTest(); if (!c) return;
    P.down = true; P.moved = false; P.cube = c; P.id = e.pointerId; P.type = e.pointerType || 'mouse';
    P.downX = e.clientX; P.downY = e.clientY; P.downT = performance.now();
    P.x = e.clientX; P.y = e.clientY; P.on = true;
    if (P.type === 'touch') pressTimer = setTimeout(beginDrag, PRESS_MS);   // a tap fills, a press grabs, a swipe scrolls
    else { e.preventDefault(); beginDrag(); }                                // no selection starts under a grab
  };
  const onMove = e => {
    if (P.down && e.pointerId !== P.id) return;
    P.x = e.clientX; P.y = e.clientY; P.dirty = true;
    if (P.down) {
      if (!P.moved && Math.hypot(e.clientX - P.downX, e.clientY - P.downY) > CLICK_PX) {
        P.moved = true;
        if (P.type === 'touch' && !P.dragging) release(false);             // the finger is scrolling: let it
      }
      return;
    }
    P.type = e.pointerType || 'mouse';
    P.on = onField(e);                                                       // the hand never appears over text
  };
  const onUp = e => {
    if (!P.down || e.pointerId !== P.id) return;
    const click = e.type === 'pointerup' && !P.moved && performance.now() - P.downT < CLICK_MS;
    const c = P.cube;
    if (e.type === 'pointerup') { P.x = e.clientX; P.y = e.clientY; }   // where the hand let go
    release(e.type === 'pointerup' && P.moved);
    if (click && c) fill(c);
  };
  const onBlur = () => { if (P.down) release(false); P.hover = null; P.on = false; setCursor(''); };   // hover resumes on the next move
  const onLeave = () => { if (!P.dragging) { P.hover = null; P.on = false; setCursor(''); } };
  window.addEventListener('pointerdown', onDown, { passive: false });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  window.addEventListener('blur', onBlur);
  document.documentElement.addEventListener('pointerleave', onLeave);

  /* ---------------------------------------------------------------- fill */
  function fill(c, index) {
    const I = c.ix;
    I.fill = index == null ? (I.fill + 1) % PALETTE.length : ((index % PALETTE.length) + PALETTE.length) % PALETTE.length;
    const hex = PALETTE[I.fill];
    if (hex == null) I.fillTo = 0;
    else {
      I.colTo.setHex(hex, LIN);                                // raw sRGB numbers: the shader writes them out untransformed
      if (I.fillA < .05) I.col.copy(I.colTo);                  // from clear: arrive in the new colour, not through grey
      I.fillTo = 1;
    }
    I.pulseT0 = performance.now();
  }
  const fills = () => cubes.map(c => { const h = PALETTE[c.ix.fill]; return h == null ? null : '#' + h.toString(16).padStart(6, '0'); });

  /* ---------------------------------------------------------------- per frame */
  function begin(now) {
    if (!isLive()) {
      if (P.dragging) release(false);
      if (P.hover) P.hover = null;
      setCursor('');
      return;
    }
    if (P.dragging) {
      setRay(P.x, P.y);
      const I = P.cube.ix;
      if (raycaster.ray.intersectPlane(plane, _v)) I.pos.copy(_v).sub(grab);
      pushSample(now, I.pos);
      sampledVelocity(now, I.vel);
      P.dirty = false;
      return;
    }
    if (P.dirty) {
      P.dirty = false;
      if (P.on && P.type !== 'touch' && !P.down) { setRay(P.x, P.y); P.hover = hitTest(); }
      else P.hover = null;
    }
    setCursor(P.hover ? 'grab' : '');
  }

  /* p: the formation position for this frame (drawn space); returns the scale, moves p if the cube is
     held, thrown, healing or nudged. Also advances the fill blend and the fill pulse. */
  function place(c, p, s, now, dt) {
    const I = c.ix;
    switch (I.hold) {
      case HOLD.drag:
        p.copy(I.pos);
        break;
      case HOLD.coast: {
        I.t += dt;
        I.pos.addScaledVector(I.vel, dt);
        I.vel.multiplyScalar(Math.pow(FRICTION, dt * 60));
        const m = s * .87, hw = ctx.halfW(I.pos.z), hh = ctx.halfH(I.pos.z);
        const cx = camera.position.x, cy = camera.position.y;
        const left = cx - hw + m, right = cx + hw - m, bottom = cy - hh + m, top = cy + hh - ctx.topPx() / ctx.px(I.pos.z) - m;
        if (right > left) {
          if (I.pos.x < left) { I.pos.x = left; I.vel.x = Math.abs(I.vel.x) * BOUNCE; }
          else if (I.pos.x > right) { I.pos.x = right; I.vel.x = -Math.abs(I.vel.x) * BOUNCE; }
        }
        if (top > bottom) {
          if (I.pos.y < bottom) { I.pos.y = bottom; I.vel.y = Math.abs(I.vel.y) * BOUNCE; }
          else if (I.pos.y > top) { I.pos.y = top; I.vel.y = -Math.abs(I.vel.y) * BOUNCE; }
        }
        // a landed cube waits a beat, not the whole coast: heal once it has rested REST_S, or at COAST_S
        I.rest = I.vel.lengthSq() < REST_V * REST_V ? I.rest + dt : 0;
        if (I.t >= COAST_S || I.rest >= REST_S) { I.hold = HOLD.heal; I.t0 = now; I.off0.copy(I.pos).sub(p); I.vel.set(0, 0, 0); }
        p.copy(I.pos);
        break;
      }
      case HOLD.heal: {
        const k = (now - I.t0) / HEAL_MS;
        if (k >= 1) { I.hold = HOLD.none; I.off.set(0, 0, 0); break; }
        I.off.copy(I.off0).multiplyScalar(1 - easeIO(k));
        p.add(I.off);
        break;
      }
      case HOLD.nudge: {
        I.nvel.addScaledVector(I.off, -SPRING_K * dt).addScaledVector(I.nvel, -SPRING_D * dt);
        I.off.addScaledVector(I.nvel, dt);
        if (I.off.lengthSq() < 1.6e-5 && I.nvel.lengthSq() < 1.6e-5) { I.hold = HOLD.none; I.off.set(0, 0, 0); I.nvel.set(0, 0, 0); }
        else p.add(I.off);
        break;
      }
    }
    // fill: alpha and colour blend toward their targets; edges follow in a darker version of the tint
    if (I.fillA !== I.fillTo || I.col.r !== I.colTo.r || I.col.g !== I.colTo.g || I.col.b !== I.colTo.b) {
      const k = Math.min(1, dt * 9);
      I.fillA += (I.fillTo - I.fillA) * k;
      if (Math.abs(I.fillTo - I.fillA) < .002) I.fillA = I.fillTo;
      I.col.lerp(I.colTo, k);
      if (Math.abs(I.col.r - I.colTo.r) + Math.abs(I.col.g - I.colTo.g) + Math.abs(I.col.b - I.colTo.b) < .004) I.col.copy(I.colTo);
      c.mat.uniforms.uFillA.value = I.fillA;
      _edge.copy(I.col).convertSRGBToLinear().multiplyScalar(.5);   // the line material is colour-managed: lerp in linear
      c.lineMat.color.lerpColors(INK, _edge, I.fillA);
    }
    const pk = (now - I.pulseT0) / beatMs;
    if (pk < 1) s *= 1 + .06 * (1 - pk) * (1 - pk);           // 1.06 → 1 over one beat
    I.s = s;
    I.px = s * 1.73 * ctx.px(p.z);
    return s;
  }

  /* a cube moving through the field pushes the cubes it passes: soft radial impulse, radius 1.2 sizes
     (depth weighted at half, so what looks like a pass on screen is one) */
  function end(now, dt) {
    for (const a of cubes) {
      const A = a.ix;
      if ((A.hold !== HOLD.drag && A.hold !== HOLD.coast) || !a.g.visible) continue;
      const speed = A.vel.length();
      if (speed < .5) continue;
      for (const b of cubes) {
        if (b === a || !b.g.visible) continue;
        const B = b.ix;
        if (B.hold !== HOLD.none && B.hold !== HOLD.nudge) continue;
        const r = NUDGE_R * (A.s + B.s);
        _v.copy(b.g.position).sub(a.g.position);
        const d = Math.sqrt(_v.x * _v.x + _v.y * _v.y + _v.z * _v.z * .25);   // depth counts half: a pass that reads as a pass on screen pushes
        if (d >= r || d < 1e-4) continue;
        _v.multiplyScalar((1 - d / r) * speed * NUDGE_K * dt / d);
        B.nvel.add(_v);
        const n = B.nvel.length();
        if (n > NUDGE_MAX) B.nvel.multiplyScalar(NUDGE_MAX / n);
        B.hold = HOLD.nudge;
      }
    }
  }

  function destroy() {
    release(false);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('blur', onBlur);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    setCursor('');
  }

  const api = {
    get enabled() { return enabled; },
    setEnabled(v) { enabled = !!v; if (!enabled) { release(false); P.hover = null; setCursor(''); } },
    fills,
  };
  // the debug hook exists only when the page opted in before the field mounted (dev harness)
  if (typeof window !== 'undefined' && window.WHITE_DEBUG_CUBES === true) {
    window.__WHITE_CUBES = {
      count: cubes.length,
      screen(i) { const c = cubes[i]; _v.copy(c.g.position).project(camera); return { x: (_v.x + 1) / 2 * ctx.viewW, y: (1 - _v.y) / 2 * ctx.viewH, px: c.ix.px, visible: c.g.visible }; },
      state(i) { const I = cubes[i].ix; return { hold: I.hold, fill: I.fill, fillA: I.fillA, pos: cubes[i].g.position.toArray(), off: I.off.toArray(), vel: I.vel.toArray(), s: I.s, px: I.px, col: I.col.toArray(), edge: cubes[i].lineMat.color.toArray() }; },
      hover: () => P.hover ? cubes.indexOf(P.hover) : -1,
      drag: () => P.dragging ? cubes.indexOf(P.cube) : -1,
      down: () => P.down,
      cursor: () => cursor,
      select: () => document.documentElement.style.userSelect || '',
      field: (x, y) => fieldAt(document.elementFromPoint(x, y), x, y),
      fill: (i, k) => fill(cubes[i], k),
      fills,
    };
  }
  return { begin, place, end, fill, fills, api, destroy };
}
