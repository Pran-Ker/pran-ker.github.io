// ════════════════════════════════════════════════════════════
// PHX-OS · scene.js
// Three.js — distorted icosahedron + curl-noise particle field
// Cursor-reactive, framerate-aware.
// ════════════════════════════════════════════════════════════

import * as THREE from "three";

/* GLSL: 3D simplex noise (Ashima/Stefan Gustavson) — public domain.
   Used for both vertex displacement on the icosahedron and curl-style
   velocity on the particle field.                                 */
const NOISE = /* glsl */`
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Composition root — pushes the visual to the right side
  // so the hero text on the left can breathe.
  const root = new THREE.Group();
  scene.add(root);

  /* ─── Distorted icosahedron ─── */
  const ico = new THREE.IcosahedronGeometry(1.0, 56);
  const icoMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime:     { value: 0 },
      uPointer:  { value: new THREE.Vector2(0, 0) },
      uDistort:  { value: 0.32 },
      uColorA:   { value: new THREE.Color("#7cdcfb") },
      uColorB:   { value: new THREE.Color("#d4a574") },
      uColorC:   { value: new THREE.Color("#ff6ad6") },
    },
    vertexShader: /* glsl */`
      ${NOISE}
      uniform float uTime;
      uniform vec2  uPointer;
      uniform float uDistort;
      varying vec3 vN;
      varying float vD;
      varying vec3 vPos;

      void main(){
        vec3 p = position;
        float t = uTime * 0.18;
        // layered noise → flowing displacement
        float n1 = snoise(p * 1.6 + vec3(t, t*0.7, -t*0.5));
        float n2 = snoise(p * 3.2 + vec3(-t*0.6, t*1.1, t*0.4));
        float disp = (n1 * 0.7 + n2 * 0.3) * uDistort;
        // pointer pull
        float pointerInf = clamp(1.0 - length(p.xy - uPointer*2.0)*0.4, 0.0, 1.0);
        disp += pointerInf * 0.18;
        vec3 displaced = p + normal * disp;
        vN = normal;
        vD = disp;
        vPos = displaced;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform float uTime;
      varying vec3 vN;
      varying float vD;
      varying vec3 vPos;
      void main(){
        // pseudo-fresnel using normal vs view direction approx
        vec3 viewDir = normalize(cameraPosition - vPos);
        float fres = pow(1.0 - max(dot(normalize(vN), viewDir), 0.0), 2.4);

        float t = clamp(vD * 1.6 + 0.5, 0.0, 1.0);
        vec3 col = mix(uColorA, uColorB, t);
        col = mix(col, uColorC, smoothstep(0.7, 1.0, fres));

        // wireframe-ish bands via noise on displacement
        float bands = smoothstep(0.4, 0.9, abs(sin(vD*22.0 + uTime*0.6)));
        col += bands * 0.15;

        float alpha = fres * 0.85 + 0.08;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  const icoMesh = new THREE.Mesh(ico, icoMat);
  root.add(icoMesh);

  // inner wireframe core
  const wireMat = new THREE.ShaderMaterial({
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:    { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uDistort: { value: 0.22 },
      uColor:   { value: new THREE.Color("#7cdcfb") },
    },
    vertexShader: icoMat.vertexShader,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      varying float vD;
      void main(){
        gl_FragColor = vec4(uColor, 0.10 + vD * 0.25);
      }
    `,
  });
  const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 10), wireMat);
  root.add(wireMesh);

  /* ─── Particle nebula ─── */
  const COUNT = 1800;
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    // Thick spherical shell, slightly flattened
    const r = 1.6 + Math.random() * 3.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i*3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i*3 + 2] = r * Math.cos(phi) * 0.45;
    seeds[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:    { value: 0 },
      uPixel:   { value: window.devicePixelRatio },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColorA:  { value: new THREE.Color("#7cdcfb") },
      uColorB:  { value: new THREE.Color("#d4a574") },
    },
    vertexShader: /* glsl */`
      ${NOISE}
      uniform float uTime;
      uniform float uPixel;
      uniform vec2  uPointer;
      attribute float aSeed;
      varying float vSeed;
      varying float vDepth;

      void main(){
        vec3 p = position;
        float t = uTime * 0.10;
        // curl-style velocity using offset noise gradients (cheap)
        float n1 = snoise(p * 0.35 + vec3(t, aSeed*4.0, -t));
        float n2 = snoise(p * 0.35 + vec3(-t, t*0.7, aSeed*2.0));
        float n3 = snoise(p * 0.35 + vec3(t*0.5, aSeed*7.0, t));
        vec3 flow = vec3(n2 - n3, n3 - n1, n1 - n2) * 0.35;
        p += flow;

        // pointer parallax — push entire field a little toward cursor
        p.xy += uPointer * 0.15;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = mix(0.6, 1.6, aSeed) * uPixel;
        gl_PointSize = size * (95.0 / -mv.z);
        vSeed = aSeed;
        vDepth = -mv.z;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vSeed;
      varying float vDepth;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorA, uColorB, vSeed);
        float depthFade = clamp(1.0 - (vDepth - 4.0) / 8.0, 0.0, 1.0);
        gl_FragColor = vec4(col, a * 0.35 * depthFade);
      }
    `,
  });
  const points = new THREE.Points(pGeo, pMat);
  root.add(points);

  // Offset root to the right side of the viewport for composition;
  // wider screens get more offset.
  const layoutRoot = () => {
    const aspect = window.innerWidth / window.innerHeight;
    if (aspect > 1.05) {
      // landscape — push right
      root.position.x = Math.min(2.6, 0.9 + aspect * 0.55);
      root.position.y = -0.2;
    } else {
      // portrait — center, push down a touch
      root.position.x = 0;
      root.position.y = -0.4;
    }
  };
  layoutRoot();
  window.addEventListener("resize", layoutRoot);

  /* ─── Resize handling ─── */
  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  /* ─── Pointer tracking ─── */
  const pointer = new THREE.Vector2(0, 0);
  const targetPointer = new THREE.Vector2(0, 0);
  const onPointer = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -((e.clientY / window.innerHeight) * 2 - 1);
    targetPointer.set(x, y);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  /* ─── Render loop ─── */
  const clock = new THREE.Clock();
  let active = true;
  let frame = 0;
  let last = performance.now();
  let fpsAcc = 0;
  let fpsFrames = 0;
  const fpsListeners = [];
  const onFps = (cb) => fpsListeners.push(cb);

  const animate = () => {
    requestAnimationFrame(animate);
    if (!active) return;
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    pointer.x += (targetPointer.x - pointer.x) * 0.06;
    pointer.y += (targetPointer.y - pointer.y) * 0.06;

    icoMat.uniforms.uTime.value = t;
    icoMat.uniforms.uPointer.value.copy(pointer);
    wireMat.uniforms.uTime.value = t;
    wireMat.uniforms.uPointer.value.copy(pointer);
    pMat.uniforms.uTime.value = t;
    pMat.uniforms.uPointer.value.copy(pointer);

    icoMesh.rotation.y += dt * 0.08 + pointer.x * dt * 0.5;
    icoMesh.rotation.x += dt * 0.04 - pointer.y * dt * 0.4;
    wireMesh.rotation.y = icoMesh.rotation.y * 0.9;
    wireMesh.rotation.x = icoMesh.rotation.x * 0.9;
    points.rotation.y -= dt * 0.015;

    renderer.render(scene, camera);

    // FPS calc
    const now = performance.now();
    fpsAcc += now - last;
    last = now;
    fpsFrames++;
    if (fpsAcc >= 500) {
      const fps = Math.round((fpsFrames / fpsAcc) * 1000);
      fpsListeners.forEach((cb) => cb(fps));
      fpsAcc = 0;
      fpsFrames = 0;
    }
    frame++;
  };
  animate();

  // Pause when offscreen to save battery
  const heroEl = document.querySelector(".hero");
  if (heroEl && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0].isIntersecting;
        canvas.style.opacity = active ? "1" : "0";
      },
      { rootMargin: "100px" }
    );
    io.observe(heroEl);
  }

  return { onFps };
}
