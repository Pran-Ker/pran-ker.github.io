const NS = 'http://www.w3.org/2000/svg';

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

function svg(viewBox) {
  const el = document.createElementNS(NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  el.setAttribute('aria-hidden', 'true');
  return el;
}

function elem(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function matrix(host, opts) {
  const cols = parseInt(opts.cols || 10, 10);
  const rows = parseInt(opts.rows || 8, 10);
  const label = opts.label || '';
  const seed = opts.seed ? hashStr(opts.seed) : 1337;
  const rng = mulberry32(seed);

  const cell = 22;
  const gap = 5;
  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  const padBottom = label ? 32 : 0;
  const root = svg(`0 0 ${w} ${h + padBottom}`);
  root.classList.add('thought-art', 'thought-art--matrix');

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rng();
      const op = 0.16 + v * 0.84;
      const rect = elem('rect', {
        x: c * (cell + gap),
        y: r * (cell + gap),
        width: cell,
        height: cell,
        rx: 2.5,
        fill: 'currentColor',
      });
      rect.classList.add('thought-art__cell');
      rect.style.setProperty('--op', op.toFixed(3));
      rect.style.setProperty('--delay', `${((r * cols + c) * 47) % 4000}ms`);
      root.appendChild(rect);
    }
  }

  if (label) {
    const text = elem('text', {
      x: w / 2,
      y: h + 22,
      'text-anchor': 'middle',
      'font-size': 14,
      fill: 'currentColor',
    });
    text.classList.add('thought-art__label');
    text.textContent = label;
    root.appendChild(text);
  }

  host.appendChild(root);
}

function lines(host, opts) {
  const seed = opts.seed ? hashStr(opts.seed) : 99;
  const rng = mulberry32(seed);
  const rowsCount = 12;
  const w = 240;
  const lineH = 6;
  const gap = 8;
  const totalH = rowsCount * lineH + (rowsCount - 1) * gap;
  const root = svg(`0 0 ${w} ${totalH}`);
  root.classList.add('thought-art', 'thought-art--lines');

  for (let i = 0; i < rowsCount; i++) {
    const indent = Math.floor(rng() * 4) * 14;
    const len = 60 + rng() * (w - 60 - indent);
    const rect = elem('rect', {
      x: indent,
      y: i * (lineH + gap),
      width: len,
      height: lineH,
      rx: lineH / 2,
      fill: 'currentColor',
    });
    rect.classList.add('thought-art__cell');
    rect.style.setProperty('--op', (0.22 + rng() * 0.55).toFixed(3));
    rect.style.setProperty('--delay', `${(i * 110) % 3000}ms`);
    root.appendChild(rect);
  }

  host.appendChild(root);
}

const ARTS = { matrix, lines };

export function ready() {
  document.querySelectorAll('[data-art]').forEach((el) => {
    if (el.dataset.artReady) return;
    const fn = ARTS[el.dataset.art];
    if (!fn) return;
    fn(el, {
      cols: el.dataset.cols,
      rows: el.dataset.rows,
      label: el.dataset.label,
      seed: el.dataset.seed,
    });
    el.dataset.artReady = '1';
  });
}
