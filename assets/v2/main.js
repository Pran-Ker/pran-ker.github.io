// ════════════════════════════════════════════════════════════
// PHX-OS · main.js
// Boot, cursor, smooth scroll, GSAP triggers, HUD,
// terminal easter egg.
// ════════════════════════════════════════════════════════════

import { initScene } from "./scene.js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointerCoarse = window.matchMedia("(pointer: coarse)").matches;

/* ──────────────── Boot sequence ──────────────── */
function runBoot() {
  // Tightened: a single decisive line, gone in ~700ms.
  // Skip on returning visits (within session) and reduced motion.
  const screen = document.getElementById("boot");
  const log = document.getElementById("boot-log");
  if (!screen || !log) return Promise.resolve();

  let seen = false;
  try { seen = sessionStorage.getItem("phx_booted") === "1"; } catch (e) {}
  if (reduced || seen) {
    screen.remove();
    return Promise.resolve();
  }
  try { sessionStorage.setItem("phx_booted", "1"); } catch (e) {}

  const line = '<span class="dim">›</span> phx-os · handshake <span class="ok">ok</span>';
  return new Promise((resolve) => {
    log.innerHTML = line;
    setTimeout(resolve, 650);
  });
}

/* ──────────────── Custom cursor ──────────────── */
function setupCursor() {
  if (pointerCoarse) return;
  const cursor = document.querySelector(".cursor");
  const label = cursor.querySelector(".cursor__label");
  if (!cursor) return;
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;

  let idleTimer = 0;
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add("is-visible");
    cursor.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => cursor.classList.add("is-idle"), 2200);
  }, { passive: true });
  window.addEventListener("pointerdown", () => cursor.classList.add("is-press"));
  window.addEventListener("pointerup",   () => cursor.classList.remove("is-press"));
  window.addEventListener("blur",        () => cursor.classList.add("is-idle"));

  const interactive = "a, button, [data-cursor], input, textarea, [role='button']";
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest(interactive);
    if (!t) return;
    cursor.classList.add("is-hover");
    label.textContent = t.dataset.cursor || "";
  });
  document.addEventListener("pointerout", (e) => {
    if (!e.target.closest(interactive)) return;
    cursor.classList.remove("is-hover");
    label.textContent = "";
  });

  const loop = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ──────────────── HUD live readouts ──────────────── */
function setupHud() {
  const clock = document.getElementById("hud-clock");
  if (clock) {
    const tick = () => {
      const d = new Date();
      const pad = (n) => n.toString().padStart(2, "0");
      clock.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }
}

/* ──────────────── Smooth scroll (Lenis) ──────────────── */
function setupSmoothScroll() {
  if (reduced) return null;
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target && id !== "top") return;
      e.preventDefault();
      lenis.scrollTo(target || 0, { offset: -20 });
    });
  });
  return lenis;
}

/* ──────────────── GSAP scroll-triggered reveals ──────────────── */
function setupReveals() {
  // Hero name letter reveal
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.display = "inline-block";
      span.style.willChange = "transform, opacity";
      span.textContent = char === " " ? " " : char;
      el.appendChild(span);
    });
  });

  if (reduced) return;

  // Hero entrance
  const tl = gsap.timeline({ delay: 0.4 });
  tl.from(".hero__kicker", { y: 12, opacity: 0, duration: 0.7, ease: "power3.out" })
    .from(".hero__line .char", {
      y: "110%",
      opacity: 0,
      duration: 1.1,
      stagger: 0.025,
      ease: "expo.out",
    }, "-=0.4")
    .from(".hero__role > *", { y: 12, opacity: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" }, "-=0.8")
    .from(".hero__tldr li",  { y: 14, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, "-=0.6")
    .from(".hero__meta-cell",{ y: 14, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power3.out" }, "-=0.4")
    .from(".hero__scroll",   { opacity: 0, y: 10, duration: 0.6, ease: "power2.out" }, "-=0.3");

  // Blogs + More list reveals
  gsap.utils.toArray(".blogs-list__item").forEach((row, i) => {
    gsap.from(row, {
      x: -20, opacity: 0, duration: 0.7, delay: i * 0.07, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 88%", once: true },
    });
  });
  gsap.utils.toArray(".more-list > li").forEach((row, i) => {
    gsap.from(row, {
      y: 24, opacity: 0, duration: 0.8, delay: i * 0.08, ease: "power3.out",
      scrollTrigger: { trigger: ".more-list", start: "top 85%", once: true },
    });
  });

  // Block-head reveals
  gsap.utils.toArray(".block-head").forEach((bh) => {
    gsap.from(bh.querySelectorAll(".kicker, .h2"), {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: bh,
        start: "top 80%",
        once: true,
      },
    });
  });

  // Card stagger
  gsap.utils.toArray(".status__grid .card").forEach((c, i) => {
    gsap.from(c, {
      y: 30, opacity: 0, duration: 0.8, delay: i * 0.07, ease: "power3.out",
      scrollTrigger: { trigger: ".status__grid", start: "top 75%", once: true },
    });
  });
  gsap.from(".ticker li", {
    y: 12, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power3.out",
    scrollTrigger: { trigger: ".ticker", start: "top 85%", once: true },
  });

  // Work rows
  gsap.utils.toArray(".work-row").forEach((row, i) => {
    gsap.from(row, {
      x: -30, opacity: 0, duration: 0.8, delay: i * 0.05, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 85%", once: true },
    });
  });

  // Paper sheet entrance
  gsap.from(".paper__sheet", {
    y: 40, opacity: 0, scale: 0.96, duration: 1.0, ease: "power3.out",
    scrollTrigger: { trigger: ".paper", start: "top 70%", once: true },
  });
  gsap.from(".paper__notes > *", {
    y: 18, opacity: 0, duration: 0.7, stagger: 0.06, ease: "power3.out",
    scrollTrigger: { trigger: ".paper__notes", start: "top 75%", once: true },
  });
  gsap.from(".paper__stat", {
    y: 16, opacity: 0, duration: 0.7, stagger: 0.07, ease: "power3.out",
    scrollTrigger: { trigger: ".paper__sheet-grid", start: "top 85%", once: true },
  });

  // Write list
  gsap.utils.toArray(".write-list li").forEach((li, i) => {
    gsap.from(li, {
      x: -20, opacity: 0, duration: 0.7, delay: i * 0.05, ease: "power3.out",
      scrollTrigger: { trigger: li, start: "top 88%", once: true },
    });
  });

  // Creed
  gsap.utils.toArray(".creed-list li").forEach((li, i) => {
    gsap.from(li, {
      y: 18, opacity: 0, duration: 0.7, delay: (i % 2) * 0.06, ease: "power3.out",
      scrollTrigger: { trigger: li, start: "top 88%", once: true },
    });
  });

  // Channels (contact)
  gsap.utils.toArray(".channel").forEach((ch, i) => {
    gsap.from(ch, {
      y: 18, opacity: 0, duration: 0.8, delay: i * 0.05, ease: "power3.out",
      scrollTrigger: { trigger: ch, start: "top 90%", once: true },
    });
  });

  // Parallax end signature
  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 0.2;
    gsap.to(el, {
      x: () => amt * 200,
      ease: "none",
      scrollTrigger: {
        trigger: ".end",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  });

  // Hero parallax on scroll (subtle)
  gsap.to(".hero__inner", {
    y: -60,
    opacity: 0.5,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.4,
    },
  });
  gsap.to(".scene", {
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 30%",
      scrub: 0.4,
    },
  });
}

/* ──────────────── Magnetic channel hover ──────────────── */
function setupMagnetic() {
  if (pointerCoarse) return;
  document.querySelectorAll("[data-magnet]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", mx + "%");
      el.style.setProperty("--my", my + "%");
    });
  });
}

/* ──────────────── Pointer-relative 3D tilt ──────────────── */
function setupTilt() {
  if (pointerCoarse || reduced) return;
  const TILT_DEG = 6;
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    let rx = 0, ry = 0, trx = 0, try_ = 0;
    let raf = 0;
    const loop = () => {
      rx += (trx - rx) * 0.12;
      ry += (try_ - ry) * 0.12;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (Math.abs(rx - trx) > 0.05 || Math.abs(ry - try_) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const ensureLoop = () => { if (!raf) raf = requestAnimationFrame(loop); };
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      try_ =  (px - 0.5) *  TILT_DEG * 2;
      trx = -(py - 0.5) *  TILT_DEG * 2;
      ensureLoop();
    });
    el.addEventListener("pointerleave", () => {
      trx = 0; try_ = 0; ensureLoop();
    });
  });
}

/* ──────────────── Live activity ticker ──────────────── */
function setupActivity() {
  const el = document.querySelector("[data-activity]");
  if (!el) return;
  const items = [
    { k: "reading", v: "Kuhn — Structure of Scientific Revolutions" },
    { k: "running",  v: "GRPO eval · coding-agent-v2 · ~31% p@1" },
    { k: "writing", v: "off-policy RL · primer" },
    { k: "listening", v: "Aphex Twin — SAW II" },
    { k: "tinkering", v: "Forge · plan synthesis" },
    { k: "thinking", v: "inference-time RL at scale?" },
    { k: "training", v: "post-training · CUA · seq=8192" },
  ];
  let i = 0;
  const kEl = el.querySelector("[data-activity-k]");
  const vEl = el.querySelector("[data-activity-v]");
  const cycle = () => {
    const next = items[i % items.length];
    el.classList.add("is-out");
    setTimeout(() => {
      kEl.textContent = next.k;
      vEl.textContent = next.v;
      el.classList.remove("is-out");
    }, 280);
    i++;
  };
  cycle();
  setInterval(cycle, 4200);
}

/* ──────────────── Terminal Easter egg ──────────────── */
function setupTerminal() {
  const term = document.getElementById("terminal");
  const body = document.getElementById("terminal-body");
  const input = document.getElementById("terminal-input");
  if (!term || !input) return;

  const open = () => {
    term.classList.add("is-open");
    term.setAttribute("aria-hidden", "false");
    setTimeout(() => input.focus(), 50);
  };
  const close = () => {
    term.classList.remove("is-open");
    term.setAttribute("aria-hidden", "true");
  };

  const print = (html, cls = "out") => {
    const line = document.createElement("div");
    line.className = cls;
    line.innerHTML = html;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };

  const commands = {
    help() {
      print(`<span class="cmd">phx-os</span> · available commands:

  <span class="cmd">about</span>      — who is Prannay
  <span class="cmd">papers</span>     — list publications
  <span class="cmd">work</span>       — current engagements
  <span class="cmd">writing</span>    — essays & notes
  <span class="cmd">stack</span>      — current tools of choice
  <span class="cmd">contact</span>    — open channels
  <span class="cmd">creed</span>      — guiding priors
  <span class="cmd">whoami</span>     — current session
  <span class="cmd">clear</span>      — wipe terminal
  <span class="cmd">sudo make-money</span> — try it`);
    },
    about() {
      print(`Prannay Hebbar — AI researcher.
Post-training, RL for agents, program synthesis.
Currently at Hexo; previously AGI Inc, Stanford (Convex Optimization w/ Boyd, HPC).
SF-based. Soccer, jiu-jitsu, poker.`);
    },
    papers() {
      print(`REAL: Benchmarking Autonomous Agents on Deterministic Simulations of Real Websites
  — NeurIPS 2025 · arXiv:<a href="https://arxiv.org/abs/2504.11543" target="_blank">2504.11543</a>
  — First author. 11 sites · 112 tasks · 18 authors. Frontier models cap ~41%.`);
    },
    work() {
      print(`Hexo (now)   — self-improving research loop · "AI that builds AI"
AGI Inc      — GRPO for web agents; REAL benchmark
Stanford     — Convex Optimization, HPC (Summer 2024)`);
    },
    writing() {
      print(`2025 · Training LLMs at Test Time for Scientific Discovery
2023 · OpenAI SRE & Scaling, Explained Easy
2023 · Attacking ML with Adversarial Examples
2023 · Vectors of Life
2022 · Order and Chaos — a Philosophy

→ <a href="https://medium.com/@Pran-Ker" target="_blank">medium.com/@Pran-Ker</a>`);
    },
    stack() {
      print(`languages   python · rust · typescript · cuda · glsl
training    grpo · ppo · sft · dpo
infra       vllm · ray · docker · k8s · gpu clusters
research    convex optimization · hpc · rl for agents`);
    },
    contact() {
      print(`email     <a href="mailto:hebbarpran@gmail.com">hebbarpran@gmail.com</a>
x         <a href="https://x.com/Pran_Ker" target="_blank">@Pran_Ker</a>
github    <a href="https://github.com/Pran-Ker" target="_blank">Pran-Ker</a>
scholar   <a href="https://scholar.google.com/citations?user=Y3jw_UgAAAAJ&hl=en" target="_blank">Google Scholar</a>
linkedin  <a href="https://www.linkedin.com/in/prannay/" target="_blank">in/prannay</a>`);
    },
    creed() {
      print(`i.    Conventional paths are too crowded to be interesting.
ii.   Cut losses early and cleanly.
iii.  Paradigm shifts beat incremental progress.
iv.   Networks compound.
v.    Timing beats quality in almost every market.
vi.   Writing code is the most reliable path to determinism.`);
    },
    whoami() {
      print(`guest@phx-os · session ${Math.random().toString(36).slice(2, 10)}
nice to meet you.`);
    },
    "sudo make-money"() {
      print(`Permission denied. Try shipping something instead.`, "err");
    },
    clear() {
      body.innerHTML = "";
      printBanner();
    },
    "": () => {},
  };

  const printBanner = () => {
    print(`<span class="cmd">phx-os</span> v2026.5 — prannay's research shell
type <span class="cmd">help</span> to list commands. <span class="dim">esc</span> to close.\n`);
  };

  const exec = (raw) => {
    const cmd = raw.trim().toLowerCase();
    print(`<span class="cmd">prannay@phx-os ~ %</span> ${cmd || ""}`);
    if (commands[cmd]) commands[cmd]();
    else if (cmd) print(`command not found: ${cmd}. try <span class="cmd">help</span>.`, "err");
  };

  // Keyboard handlers
  window.addEventListener("keydown", (e) => {
    if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey &&
        !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      if (term.classList.contains("is-open")) close();
      else { if (!body.innerHTML.trim()) printBanner(); open(); }
    }
    if (e.key === "Escape" && term.classList.contains("is-open")) {
      e.preventDefault();
      close();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      exec(input.value);
      input.value = "";
    }
  });

  document.querySelectorAll("[data-terminal-close]").forEach((b) =>
    b.addEventListener("click", close)
  );
}

/* ──────────────── Boot orchestration ──────────────── */
async function start() {
  setupCursor();
  setupHud();
  setupMagnetic();
  setupTilt();
  setupActivity();
  setupTerminal();

  // Init WebGL
  const canvas = document.getElementById("scene");
  let sceneApi = null;
  if (canvas && !reduced) {
    try {
      sceneApi = initScene(canvas);
      const fpsEl = document.getElementById("hud-fps");
      if (fpsEl) sceneApi.onFps((fps) => { fpsEl.textContent = fps; });
    } catch (err) {
      console.warn("Scene failed:", err);
      canvas.remove();
    }
  } else if (canvas) {
    canvas.remove();
  }

  await runBoot();
  document.documentElement.classList.remove("boot");

  setupSmoothScroll();
  setupReveals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
