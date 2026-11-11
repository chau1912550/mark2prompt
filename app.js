'use strict';

/* Mark2Prompt: mark up an image, number what should change, export the image plus a prompt for an AI.
   Everything runs in the browser. Images are never uploaded. */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const stage = $('#stage');
const wrap = $('#canvasWrap');
const textInput = $('#textInput');

/* ---------- icons (24px grid, stroke) ---------- */

const ICONS = {
  select: '<path d="M5 3l14 7.5-6.2 1.8L10 19z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 013 0V11M11 10.5V4a1.5 1.5 0 013 0v7M14 10.5V5.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.5a6 6 0 01-5-2.7L2.8 15a1.5 1.5 0 012.4-1.8L8 16"/>',
  pin: '<circle cx="12" cy="12" r="8"/><path d="M10.5 9.5L12.5 8v8"/>',
  rect: '<rect x="4" y="6" width="16" height="12" rx="1.5"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>',
  arrow: '<path d="M5 19L19 5M10 5h9v9"/>',
  line: '<path d="M5 19L19 5"/>',
  pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
  highlight: '<path d="M9 11l-5 5v4h4l5-5"/><path d="M9 11l6.5-6.5a2.1 2.1 0 013 3L13 15z"/>',
  text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
  blur: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
  crop: '<path d="M6 2v14a2 2 0 002 2h14"/><path d="M2 6h14a2 2 0 012 2v14"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a2 2 0 012-2h10"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-2.6 3.4M6.5 6.6A16 16 0 002 12s3.5 7 10 7a9.6 9.6 0 005.4-1.6"/><path d="M3 3l18 18M9.9 9.9a3 3 0 004.2 4.2"/>',
  open: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  save: '<path d="M5 3h11l5 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M7 3v5h8M7 21v-7h10v7"/>',
  newfile: '<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M12 12v6M9 15h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .3c0 1.7-2.5 2.2-2.5 3.7M12 17h.01"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 20"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  marks: '<circle cx="7" cy="7" r="3"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M13 7h7M4 17h5"/>',
};
const icon = (name) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
function paintIcons(root = document) {
  root.querySelectorAll('i[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
}

/* ---------- constants and state ---------- */

const ACTIONS = ['Change', 'Remove', 'Add', 'Move', 'Recolor', 'Resize', 'Fix', 'Replace', 'Question', 'Keep'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const NOTE_TYPES = new Set(['marker', 'rect', 'ellipse', 'arrow', 'line', 'pen', 'highlight']);
const BOX_TYPES = new Set(['rect', 'ellipse', 'highlight', 'blur']);
const DASHABLE = new Set(['pen', 'line', 'arrow', 'rect', 'ellipse']);
const SHAPE_TYPES = new Set([...NOTE_TYPES, 'text', 'blur']);
const TYPE_LABEL = {
  marker: 'Pin', rect: 'Box', ellipse: 'Circle', arrow: 'Arrow', line: 'Line',
  pen: 'Freehand', highlight: 'Highlight', blur: 'Pixelate', text: 'Text',
};
const TOOL_KEYS = {
  v: 'select', h: 'hand', p: 'pen', l: 'line', a: 'arrow', r: 'rect',
  e: 'ellipse', m: 'marker', n: 'marker', t: 'text', g: 'highlight', b: 'blur', c: 'crop',
};
const PRESETS = {
  general: {
    label: 'General request',
    intro: 'Please make the changes I marked.',
  },
  ui: {
    label: 'UI / code change',
    intro: 'This is a screenshot of a user interface I am building. Change the code so the UI matches the numbered requests below. Keep everything that is not marked exactly as it is.',
  },
  image: {
    label: 'Image editing',
    intro: 'Edit this image as described for each numbered mark. Keep all unmarked areas unchanged.',
  },
  drawing: {
    label: 'Technical drawing review',
    intro: 'This is a technical / engineering drawing. For each numbered mark, check or change the marked feature as asked. Quote the dimensions and labels you read from the drawing, and say when something is unreadable.',
  },
  explain: {
    label: 'Explain / answer questions',
    intro: 'Explain the parts I marked on this image. Answer each numbered item separately.',
  },
  review: {
    label: 'Design feedback',
    intro: 'Review the marked parts of this design. For each number, say what works, what does not, and suggest a concrete fix.',
  },
};

const state = {
  goal: '',
  images: [],       // {id, name, src, w, h, note, shapes, undo, redo}
  current: -1,
  tool: 'marker',
  color: '#ef4444',
  size: 4,
  dash: false,
  preset: 'general',
  legend: false,
  hideMarks: false,
  view: { scale: 1, x: 0, y: 0 },
  selectedId: null,
};
const imgCache = new Map(); // image id -> HTMLImageElement

let drawing = null;     // shape being drawn
let dragging = null;    // {id, last, moved}
let resizing = null;    // {id, handle, fixed, moved}
let panning = null;     // {sx, sy, vx, vy}
let crop = null;        // {x, y, w, h} in image px
let cropping = false;   // dragging the crop box
let spaceDown = false;
let editingText = null; // {id|null, x, y, fontSize, color}

const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cur = () => state.images[state.current] || null;
const unitOf = (img) => Math.max(1, Math.max(img.w, img.h) / 1200);
const newNote = () => ({ action: 'Change', priority: 'Medium', text: '' });
const round1 = (v) => Math.round(v * 10) / 10;
const selected = () => { const img = cur(); return img ? img.shapes.find((s) => s.id === state.selectedId) || null : null; };
const textFont = (px) => `600 ${px}px Inter, system-ui, sans-serif`;
const fontSizeFor = (size, unit) => Math.round((10 + size * 2.5) * unit);

/* ---------- small helpers ---------- */

let toastTimer;
function toast(msg, isError = false) {
  const t = $('#toast');
  t.innerHTML = icon(isError ? 'x' : 'check');
  t.append(document.createTextNode(msg));
  t.className = 'show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 2800);
}

function contrastOf(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#ffffff';
  const n = parseInt(m[1], 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#111111' : '#ffffff';
}

function readAsDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}

function loadImageEl(src) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('Could not load image'));
    im.src = src;
  });
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s) => (s || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';

function safeStorage(fn, fallback) {
  try { return fn(); } catch { return fallback; }
}

/* ---------- geometry ---------- */

function norm(s) {
  return { x: Math.min(s.x, s.x + s.w), y: Math.min(s.y, s.y + s.h), w: Math.abs(s.w), h: Math.abs(s.h) };
}

const markerR = (s, unit) => (12 + s.size * 1.5) * unit;
const badgeR = (unit) => 11 * unit;
const textLines = (s) => String(s.text || '').split('\n');

function bboxOf(s, unit) {
  switch (s.type) {
    case 'pen': {
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      for (const [x, y] of s.points) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    }
    case 'line': case 'arrow':
      return { x: Math.min(s.x1, s.x2), y: Math.min(s.y1, s.y2), w: Math.abs(s.x2 - s.x1), h: Math.abs(s.y2 - s.y1) };
    case 'marker': {
      const r = markerR(s, unit);
      return { x: s.x - r, y: s.y - r, w: r * 2, h: r * 2 };
    }
    case 'text': {
      ctx.save();
      ctx.font = textFont(s.fontSize);
      const lines = textLines(s);
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width), s.fontSize / 2);
      ctx.restore();
      return { x: s.x, y: s.y, w, h: lines.length * s.fontSize * 1.25 };
    }
    default:
      return norm(s);
  }
}

function anchorOf(s) {
  switch (s.type) {
    case 'line': case 'arrow': return { x: s.x1, y: s.y1 };
    case 'pen': return { x: s.points[0][0], y: s.points[0][1] };
    case 'marker': return { x: s.x, y: s.y };
    default: { const b = norm(s); return { x: b.x, y: b.y }; }
  }
}

function segDist(p, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = clamp(len2 ? ((p.x - x1) * dx + (p.y - y1) * dy) / len2 : 0, 0, 1);
  return Math.hypot(p.x - (x1 + t * dx), p.y - (y1 + t * dy));
}

const inBox = (p, b, pad) => p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;

function hits(s, p, unit) {
  const tol = 8 * unit;
  const half = (s.size * unit) / 2;
  if (NOTE_TYPES.has(s.type) && s.type !== 'marker') {
    const a = anchorOf(s);
    if (Math.hypot(p.x - a.x, p.y - a.y) <= badgeR(unit)) return true;
  }
  switch (s.type) {
    case 'marker':
      return Math.hypot(p.x - s.x, p.y - s.y) <= markerR(s, unit) + tol / 2;
    case 'line': case 'arrow':
      return segDist(p, s.x1, s.y1, s.x2, s.y2) <= tol + half;
    case 'pen': {
      const pts = s.points;
      if (pts.length === 1) return Math.hypot(p.x - pts[0][0], p.y - pts[0][1]) <= tol + half;
      for (let i = 1; i < pts.length; i++) {
        if (segDist(p, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) <= tol + half) return true;
      }
      return false;
    }
    case 'rect': {
      const b = norm(s);
      const e = tol + half;
      return inBox(p, b, e) && !(p.x > b.x + e && p.x < b.x + b.w - e && p.y > b.y + e && p.y < b.y + b.h - e);
    }
    case 'ellipse': {
      const b = norm(s);
      const rx = Math.max(b.w / 2, 1), ry = Math.max(b.h / 2, 1);
      const d = Math.hypot((p.x - (b.x + rx)) / rx, (p.y - (b.y + ry)) / ry);
      return Math.abs(d - 1) * Math.min(rx, ry) <= tol + half;
    }
    default:
      return inBox(p, bboxOf(s, unit), tol / 2);
  }
}

function hitTest(img, p) {
  const unit = unitOf(img);
  for (let i = img.shapes.length - 1; i >= 0; i--) {
    if (hits(img.shapes[i], p, unit)) return img.shapes[i];
  }
  return null;
}

function moveShape(s, dx, dy) {
  switch (s.type) {
    case 'pen': for (const pt of s.points) { pt[0] += dx; pt[1] += dy; } break;
    case 'line': case 'arrow': s.x1 += dx; s.y1 += dy; s.x2 += dx; s.y2 += dy; break;
    default: s.x += dx; s.y += dy;
  }
}

function numbering(img) {
  const map = new Map();
  let n = 0;
  for (const s of img.shapes) if (NOTE_TYPES.has(s.type)) map.set(s.id, ++n);
  return map;
}

/* Resize handles: corners for boxes, end points for lines. Sizes are in screen px. */
const handleR = () => 5.5 / state.view.scale;

function handlesOf(s) {
  if (BOX_TYPES.has(s.type)) {
    const b = norm(s);
    return [
      { key: 'nw', x: b.x, y: b.y }, { key: 'ne', x: b.x + b.w, y: b.y },
      { key: 'sw', x: b.x, y: b.y + b.h }, { key: 'se', x: b.x + b.w, y: b.y + b.h },
    ];
  }
  if (s.type === 'line' || s.type === 'arrow') return [{ key: 'p1', x: s.x1, y: s.y1 }, { key: 'p2', x: s.x2, y: s.y2 }];
  return [];
}

function handleAt(s, p) {
  const r = handleR() * 1.8;
  return handlesOf(s).find((h) => Math.hypot(p.x - h.x, p.y - h.y) <= r) || null;
}

function startResize(s, h) {
  if (h.key === 'p1' || h.key === 'p2') return { id: s.id, handle: h.key, moved: false };
  const b = norm(s);
  const fixed = {
    nw: { x: b.x + b.w, y: b.y + b.h }, ne: { x: b.x, y: b.y + b.h },
    sw: { x: b.x + b.w, y: b.y }, se: { x: b.x, y: b.y },
  }[h.key];
  return { id: s.id, handle: h.key, fixed, moved: false };
}

function applyResize(s, r, p, shift) {
  if (r.handle === 'p1') { s.x1 = p.x; s.y1 = p.y; return; }
  if (r.handle === 'p2') { s.x2 = p.x; s.y2 = p.y; return; }
  let w = p.x - r.fixed.x, h = p.y - r.fixed.y;
  if (shift) { const m = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * m; h = Math.sign(h || 1) * m; }
  s.x = r.fixed.x; s.y = r.fixed.y; s.w = w; s.h = h;
}

/* ---------- drawing ---------- */

const pixCanvas = document.createElement('canvas');

function pixelate(c, el, b) {
  if (!el || b.w < 2 || b.h < 2) return;
  const block = Math.max(8, Math.round(Math.min(b.w, b.h) / 8));
  const tw = Math.max(1, Math.ceil(b.w / block));
  const th = Math.max(1, Math.ceil(b.h / block));
  pixCanvas.width = tw;
  pixCanvas.height = th;
  pixCanvas.getContext('2d').drawImage(el, b.x, b.y, b.w, b.h, 0, 0, tw, th);
  c.imageSmoothingEnabled = false;
  c.drawImage(pixCanvas, 0, 0, tw, th, b.x, b.y, b.w, b.h);
  c.imageSmoothingEnabled = true;
}

function drawBadge(c, x, y, num, color, r) {
  c.save();
  c.shadowColor = 'rgba(0,0,0,.25)';
  c.shadowBlur = r * 0.35;
  c.shadowOffsetY = r * 0.08;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = color;
  c.fill();
  c.shadowColor = 'transparent';
  c.lineWidth = Math.max(1.5, r * 0.16);
  c.strokeStyle = contrastOf(color) === '#ffffff' ? '#ffffff' : '#111111';
  c.stroke();
  if (num != null) {
    c.fillStyle = contrastOf(color);
    c.font = `700 ${Math.round(r * (num > 9 ? 0.95 : 1.1))}px Inter, system-ui, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(String(num), x, y + r * 0.05);
  }
  c.restore();
}

function drawShape(c, s, unit, el, num) {
  const lw = s.size * unit;
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.strokeStyle = s.color;
  c.fillStyle = s.color;
  c.lineWidth = lw;
  if (s.dash && DASHABLE.has(s.type)) c.setLineDash([lw * 2.5, lw * 2]);
  switch (s.type) {
    case 'pen': {
      const p = s.points;
      c.beginPath();
      c.moveTo(p[0][0], p[0][1]);
      if (p.length === 1) c.lineTo(p[0][0] + 0.01, p[0][1]);
      for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
      c.stroke();
      break;
    }
    case 'line':
      c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke();
      break;
    case 'arrow': {
      const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
      const len = Math.max(14 * unit, lw * 3.5);
      const cut = Math.min(len * 0.6, Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
      c.beginPath();
      c.moveTo(s.x1, s.y1);
      c.lineTo(s.x2 - cut * Math.cos(ang), s.y2 - cut * Math.sin(ang));
      c.stroke();
      c.setLineDash([]);
      c.beginPath();
      c.moveTo(s.x2, s.y2);
      c.lineTo(s.x2 - len * Math.cos(ang - Math.PI / 7), s.y2 - len * Math.sin(ang - Math.PI / 7));
      c.lineTo(s.x2 - len * Math.cos(ang + Math.PI / 7), s.y2 - len * Math.sin(ang + Math.PI / 7));
      c.closePath();
      c.fill();
      break;
    }
    case 'rect': { const b = norm(s); c.strokeRect(b.x, b.y, b.w, b.h); break; }
    case 'ellipse': {
      const b = norm(s);
      c.beginPath();
      c.ellipse(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w / 2, 0.5), Math.max(b.h / 2, 0.5), 0, 0, Math.PI * 2);
      c.stroke();
      break;
    }
    case 'highlight': {
      const b = norm(s);
      c.globalAlpha = 0.3;
      c.fillRect(b.x, b.y, b.w, b.h);
      break;
    }
    case 'blur': pixelate(c, el, norm(s)); break;
    case 'marker': drawBadge(c, s.x, s.y, num, s.color, markerR(s, unit)); break;
    case 'text': {
      c.font = textFont(s.fontSize);
      c.textBaseline = 'top';
      c.lineWidth = Math.max(2, s.fontSize / 6);
      c.strokeStyle = contrastOf(s.color) === '#ffffff' ? 'rgba(255,255,255,.92)' : 'rgba(0,0,0,.75)';
      textLines(s).forEach((ln, i) => {
        const y = s.y + i * s.fontSize * 1.25;
        c.strokeText(ln, s.x, y);
        c.fillText(ln, s.x, y);
      });
      break;
    }
  }
  c.restore();
  if (num != null && s.type !== 'marker') {
    const a = anchorOf(s);
    drawBadge(c, a.x, a.y, num, s.color, badgeR(unit));
  }
}

function drawSelection(c, s, unit) {
  const k = 1 / state.view.scale;
  const accent = '#2563eb';
  c.save();
  const hs = handlesOf(s);
  if (!hs.length || s.type === 'line' || s.type === 'arrow') {
    const b = bboxOf(s, unit);
    const pad = 6 * k;
    c.setLineDash([5 * k, 4 * k]);
    c.lineWidth = 1.5 * k;
    c.strokeStyle = accent;
    c.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  } else {
    const b = norm(s);
    c.lineWidth = 1.5 * k;
    c.strokeStyle = accent;
    c.strokeRect(b.x, b.y, b.w, b.h);
  }
  c.setLineDash([]);
  const r = handleR();
  for (const h of hs) {
    c.fillStyle = '#ffffff';
    c.strokeStyle = accent;
    c.lineWidth = 1.5 * k;
    c.beginPath();
    c.rect(h.x - r, h.y - r, r * 2, r * 2);
    c.fill();
    c.stroke();
  }
  c.restore();
}

function drawCropOverlay(c, img) {
  if (!crop) return;
  const b = norm(crop);
  const k = 1 / state.view.scale;
  c.save();
  c.fillStyle = 'rgba(8, 10, 14, .55)';
  c.beginPath();
  c.rect(0, 0, img.w, img.h);
  c.rect(b.x, b.y, b.w, b.h);
  c.fill('evenodd');
  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.5 * k;
  c.setLineDash([6 * k, 4 * k]);
  c.strokeRect(b.x, b.y, b.w, b.h);
  c.setLineDash([]);
  c.strokeStyle = 'rgba(255,255,255,.35)';
  c.lineWidth = k;
  for (let i = 1; i < 3; i++) {
    c.beginPath(); c.moveTo(b.x + (b.w * i) / 3, b.y); c.lineTo(b.x + (b.w * i) / 3, b.y + b.h); c.stroke();
    c.beginPath(); c.moveTo(b.x, b.y + (b.h * i) / 3); c.lineTo(b.x + b.w, b.y + (b.h * i) / 3); c.stroke();
  }
  c.restore();
}

function drawScene(c, img, opts = {}) {
  const el = imgCache.get(img.id);
  c.clearRect(0, 0, img.w, img.h);
  if (el) c.drawImage(el, 0, 0);
  if (!opts.export && state.hideMarks) { drawCropOverlay(c, img); return; }
  const unit = unitOf(img);
  const nums = numbering(img);
  for (const s of img.shapes) {
    if (!opts.export && editingText && s.id === editingText.id) continue;
    drawShape(c, s, unit, el, nums.get(s.id) ?? null);
  }
  if (opts.extra) drawShape(c, opts.extra, unit, el, NOTE_TYPES.has(opts.extra.type) ? nums.size + 1 : null);
  if (!opts.export) {
    const s = selected();
    if (s && !crop) drawSelection(c, s, unit);
    drawCropOverlay(c, img);
  }
}

function render() {
  const img = cur();
  if (img) drawScene(ctx, img, { extra: drawing });
}

function renderImageCanvas(img) {
  const c = document.createElement('canvas');
  c.width = img.w;
  c.height = img.h;
  drawScene(c.getContext('2d'), img, { export: true });
  return c;
}

/* Optional legend: numbered notes drawn under the image, so one picture carries everything. */
function wrapText(c, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      if (!word) continue;
      const test = line ? `${line} ${word}` : word;
      if (c.measureText(test).width <= maxW || !line) line = test;
      else { out.push(line); line = word; }
    }
    out.push(line);
  }
  return out;
}

function renderExportCanvas(img) {
  const base = renderImageCanvas(img);
  if (!state.legend) return base;
  const marks = img.shapes.filter((s) => NOTE_TYPES.has(s.type));
  if (!marks.length) return base;
  const nums = numbering(img);
  const width = Math.max(img.w, 640);
  const u = Math.max(1, width / 1200);
  const fs = Math.round(15 * u);
  const pad = Math.round(20 * u);
  const lh = Math.round(fs * 1.5);
  const r = Math.round(11 * u);
  const textX = pad + r * 2 + Math.round(10 * u);
  const maxW = width - textX - pad;
  const m = document.createElement('canvas').getContext('2d');
  const rows = marks.map((s) => {
    const n = s.note || newNote();
    m.font = `400 ${fs}px Inter, system-ui, sans-serif`;
    const lines = wrapText(m, n.text.trim() || '(see drawing)', maxW);
    return { s, n, lines, h: lh + lines.length * lh + Math.round(8 * u) };
  });
  const legendH = pad * 2 + Math.round(fs * 1.8) + rows.reduce((a, b) => a + b.h, 0);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = img.h + legendH;
  const c = out.getContext('2d');
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, width, out.height);
  c.drawImage(base, 0, 0);
  c.fillStyle = '#e4e7ec';
  c.fillRect(0, img.h, width, Math.max(1, u));
  let y = img.h + pad;
  c.fillStyle = '#101828';
  c.textBaseline = 'top';
  c.font = `700 ${Math.round(fs * 1.1)}px Inter, system-ui, sans-serif`;
  c.fillText(`Notes${img.name ? ` · ${img.name}` : ''}`, pad, y);
  y += Math.round(fs * 1.8);
  for (const row of rows) {
    drawBadge(c, pad + r, y + lh / 2, nums.get(row.s.id), row.s.color, r);
    c.fillStyle = '#101828';
    c.font = `700 ${fs}px Inter, system-ui, sans-serif`;
    const head = row.n.action.toUpperCase();
    c.fillText(head, textX, y + (lh - fs) / 2);
    const hw = c.measureText(head).width;
    c.font = `500 ${fs}px Inter, system-ui, sans-serif`;
    c.fillStyle = row.n.priority === 'High' ? '#d92d20' : '#667085';
    c.fillText(`  ·  ${row.n.priority} priority`, textX + hw, y + (lh - fs) / 2);
    c.fillStyle = '#344054';
    c.font = `400 ${fs}px Inter, system-ui, sans-serif`;
    row.lines.forEach((ln, i) => c.fillText(ln, textX, y + lh + i * lh + (lh - fs) / 2));
    y += row.h;
  }
  return out;
}

/* ---------- view (zoom / pan) ---------- */

function applyView() {
  const { scale, x, y } = state.view;
  wrap.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  const z = Math.round(scale * 100) + '%';
  $('#zoomInfo').textContent = z;
  $('#stZoom').textContent = cur() ? `Zoom ${z}` : '';
  if (editingText) positionTextInput();
  render();
}

function fitView() {
  const img = cur();
  if (!img) return;
  const r = stage.getBoundingClientRect();
  const pad = 40;
  const s = Math.min((r.width - pad * 2) / img.w, (r.height - pad * 2) / img.h, 1);
  state.view.scale = s > 0 ? s : 1;
  state.view.x = (r.width - img.w * state.view.scale) / 2;
  state.view.y = (r.height - img.h * state.view.scale) / 2;
  applyView();
}

function zoomAt(mx, my, factor) {
  const v = state.view;
  const ns = clamp(v.scale * factor, 0.05, 20);
  v.x = mx - ((mx - v.x) * ns) / v.scale;
  v.y = my - ((my - v.y) * ns) / v.scale;
  v.scale = ns;
  applyView();
}

function zoomCenter(factor) {
  const r = stage.getBoundingClientRect();
  zoomAt(r.width / 2, r.height / 2, factor);
}

function toImg(e) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * canvas.width) / r.width, y: ((e.clientY - r.top) * canvas.height) / r.height };
}

/* ---------- images and tabs ---------- */

async function addImage(blob, name) {
  try {
    const src = await readAsDataURL(blob);
    const el = await loadImageEl(src);
    const rec = {
      id: uid(), name: name || `Image ${state.images.length + 1}`, src,
      w: el.naturalWidth, h: el.naturalHeight, note: '', shapes: [], undo: [], redo: [],
    };
    imgCache.set(rec.id, el);
    state.images.push(rec);
    switchImage(state.images.length - 1);
    scheduleSave();
  } catch {
    toast('Could not open that image', true);
  }
}

async function handleFiles(files) {
  for (const f of files) {
    if (f.type.startsWith('image/')) await addImage(f, f.name.replace(/\.[^.]+$/, ''));
    else if (/\.json$/i.test(f.name) || f.type === 'application/json') await openProjectFile(f);
    else toast(`Skipped ${f.name}: not an image or project file`, true);
  }
}

function switchImage(i) {
  finishTextEdit(true);
  cancelCrop();
  state.current = i;
  state.selectedId = null;
  const img = cur();
  $('#empty').hidden = !!img;
  wrap.hidden = !img;
  $('#imgNote').disabled = !img;
  $('#imgNote').value = img ? img.note || '' : '';
  if (img) {
    canvas.width = img.w;
    canvas.height = img.h;
    fitView();
  }
  renderTabs();
  renderNotes();
  updateChrome();
}

function closeImage(i) {
  const img = state.images[i];
  if (img.shapes.length && !confirm(`Close "${img.name}"? Its marks will be lost.`)) return;
  imgCache.delete(img.id);
  state.images.splice(i, 1);
  let next = state.current;
  if (i < next || next >= state.images.length) next -= 1;
  if (next < 0 && state.images.length) next = 0;
  switchImage(state.images.length ? next : -1);
  scheduleSave();
}

function renderTabs() {
  const box = $('#tabs');
  box.textContent = '';
  state.images.forEach((img, i) => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (i === state.current ? ' active' : '');
    tab.title = `${img.name}: double-click to rename`;
    const thumb = document.createElement('img');
    thumb.className = 'thumb';
    thumb.src = img.src;
    thumb.alt = '';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = img.name;
    const n = img.shapes.filter((s) => NOTE_TYPES.has(s.type)).length;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = n ? String(n) : '';
    const close = document.createElement('span');
    close.className = 'close';
    close.innerHTML = icon('x');
    close.title = 'Close image';
    close.addEventListener('click', (e) => { e.stopPropagation(); closeImage(i); });
    tab.append(thumb, name, count, close);
    tab.addEventListener('click', () => { if (i !== state.current) switchImage(i); });
    tab.addEventListener('dblclick', () => {
      const v = prompt('Image name', img.name);
      if (v && v.trim()) { img.name = v.trim(); renderTabs(); updatePrompt(); scheduleSave(); }
    });
    box.appendChild(tab);
  });
  const add = document.createElement('button');
  add.className = 'tab-add';
  add.innerHTML = `${icon('plus')}<span>Add image</span>`;
  add.addEventListener('click', () => $('#fileInput').click());
  box.appendChild(add);
}

function refreshTabCounts() {
  const tabs = $$('#tabs .tab');
  state.images.forEach((img, i) => {
    const n = img.shapes.filter((s) => NOTE_TYPES.has(s.type)).length;
    const el = tabs[i] && tabs[i].querySelector('.count');
    if (el) el.textContent = n ? String(n) : '';
  });
}

/* ---------- edits and undo ---------- */

function entryOf(img, withImage) {
  const e = { shapes: JSON.stringify(img.shapes) };
  if (withImage) Object.assign(e, { src: img.src, w: img.w, h: img.h });
  return e;
}

function snapshot(withImage = false) {
  const img = cur();
  if (!img) return;
  img.undo.push(entryOf(img, withImage));
  if (img.undo.length > 100) img.undo.shift();
  img.redo.length = 0;
}

async function restoreEntry(img, e) {
  img.shapes = JSON.parse(e.shapes);
  if (e.src && e.src !== img.src) {
    const el = await loadImageEl(e.src);
    imgCache.set(img.id, el);
    Object.assign(img, { src: e.src, w: e.w, h: e.h });
    canvas.width = img.w;
    canvas.height = img.h;
    renderTabs();
    fitView();
  }
  afterChange();
}

function undo() {
  const img = cur();
  if (!img || !img.undo.length) return;
  finishTextEdit(true);
  const e = img.undo.pop();
  img.redo.push(entryOf(img, !!e.src));
  restoreEntry(img, e);
}

function redo() {
  const img = cur();
  if (!img || !img.redo.length) return;
  const e = img.redo.pop();
  img.undo.push(entryOf(img, !!e.src));
  restoreEntry(img, e);
}

function afterChange() {
  const img = cur();
  if (img && state.selectedId && !img.shapes.some((s) => s.id === state.selectedId)) state.selectedId = null;
  render();
  renderNotes();
  refreshTabCounts();
  updateChrome();
  scheduleSave();
}

function deleteSelected() {
  const img = cur();
  if (!img || !state.selectedId) return;
  snapshot();
  img.shapes = img.shapes.filter((s) => s.id !== state.selectedId);
  state.selectedId = null;
  afterChange();
}

function deleteShape(id) {
  const img = cur();
  if (!img) return;
  snapshot();
  img.shapes = img.shapes.filter((s) => s.id !== id);
  afterChange();
}

function duplicateSelected() {
  const img = cur();
  const s = selected();
  if (!img || !s) return;
  snapshot();
  const copy = JSON.parse(JSON.stringify(s));
  copy.id = uid();
  moveShape(copy, 16 * unitOf(img), 16 * unitOf(img));
  img.shapes.push(copy);
  state.selectedId = copy.id;
  afterChange();
}

let nudgeTimer = null;
function nudge(dx, dy) {
  const s = selected();
  if (!s) return;
  if (!nudgeTimer) snapshot();
  clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(() => { nudgeTimer = null; updatePrompt(); scheduleSave(); }, 600);
  moveShape(s, dx, dy);
  render();
}

function selectShape(id, scrollCard = true) {
  state.selectedId = id;
  render();
  $$('.note').forEach((n) => n.classList.toggle('selected', n.dataset.id === id));
  if (id && scrollCard) {
    const card = document.querySelector(`.note[data-id="${id}"]`);
    if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  updateChrome();
}

function finalize(d) {
  const img = cur();
  if (d.type === 'pen') {
    d.points = d.points.map(([x, y]) => [round1(x), round1(y)]);
  } else if (d.type === 'line' || d.type === 'arrow') {
    for (const k of ['x1', 'y1', 'x2', 'y2']) d[k] = round1(d[k]);
  } else if (BOX_TYPES.has(d.type)) {
    let b = norm(d);
    if (d.type === 'blur') {
      const x1 = clamp(b.x, 0, img.w), y1 = clamp(b.y, 0, img.h);
      const x2 = clamp(b.x + b.w, 0, img.w), y2 = clamp(b.y + b.h, 0, img.h);
      b = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    }
    Object.assign(d, { x: round1(b.x), y: round1(b.y), w: round1(b.w), h: round1(b.h) });
  }
}

function isTiny(d, unit) {
  const min = 4 * unit;
  if (d.type === 'pen') return false;
  if (d.type === 'line' || d.type === 'arrow') return Math.hypot(d.x2 - d.x1, d.y2 - d.y1) < min;
  return Math.abs(d.w) < min || Math.abs(d.h) < min;
}

/* ---------- crop ---------- */

function updateCropBar() {
  const bar = $('#cropBar');
  bar.hidden = state.tool !== 'crop' || !cur();
  if (bar.hidden) return;
  const ok = crop && Math.abs(crop.w) >= 8 && Math.abs(crop.h) >= 8;
  $('#btnCropApply').disabled = !ok;
  $('#cropSize').textContent = ok ? `${Math.round(Math.abs(crop.w))} × ${Math.round(Math.abs(crop.h))} px` : 'Drag to select an area';
}

function cancelCrop() {
  crop = null;
  cropping = false;
  updateCropBar();
  render();
}

async function applyCrop() {
  const img = cur();
  if (!img || !crop) return;
  const b = norm(crop);
  const x = Math.round(clamp(b.x, 0, img.w)), y = Math.round(clamp(b.y, 0, img.h));
  const w = Math.round(clamp(b.x + b.w, 0, img.w)) - x, h = Math.round(clamp(b.y + b.h, 0, img.h)) - y;
  if (w < 8 || h < 8) return;
  snapshot(true);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(imgCache.get(img.id), x, y, w, h, 0, 0, w, h);
  const src = c.toDataURL('image/png');
  const el = await loadImageEl(src);
  imgCache.set(img.id, el);
  Object.assign(img, { src, w, h });
  for (const s of img.shapes) moveShape(s, -x, -y);
  crop = null;
  canvas.width = w;
  canvas.height = h;
  setTool('select');
  renderTabs();
  fitView();
  afterChange();
  toast(`Cropped to ${w} × ${h} px`);
}

/* ---------- pointer input ---------- */

stage.addEventListener('pointerdown', (e) => {
  if (e.target === textInput || e.target.closest('.floatbar') || e.target.closest('.empty-card')) return;
  if (editingText) { e.preventDefault(); finishTextEdit(true); return; }
  const img = cur();
  if (e.button === 1 || (e.button === 0 && (spaceDown || state.tool === 'hand'))) {
    panning = { sx: e.clientX, sy: e.clientY, vx: state.view.x, vy: state.view.y };
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('panning');
    e.preventDefault();
    return;
  }
  if (e.button !== 0 || !img) return;
  e.preventDefault();
  const p = toImg(e);
  const t = state.tool;

  if (t === 'crop') {
    crop = { x: p.x, y: p.y, w: 0, h: 0 };
    cropping = true;
    stage.setPointerCapture(e.pointerId);
    updateCropBar();
    return;
  }

  if (t === 'select') {
    const sel = selected();
    const h = sel && !state.hideMarks && handleAt(sel, p);
    if (h) {
      resizing = startResize(sel, h);
      stage.setPointerCapture(e.pointerId);
      return;
    }
    const hit = state.hideMarks ? null : hitTest(img, p);
    selectShape(hit ? hit.id : null);
    if (hit) {
      dragging = { id: hit.id, last: p, moved: false };
      stage.setPointerCapture(e.pointerId);
    }
    return;
  }
  if (state.hideMarks) toggleMarks(false);
  if (t === 'text') {
    const hit = hitTest(img, p);
    startTextEdit(hit && hit.type === 'text' ? hit : null, p);
    return;
  }
  if (t === 'marker') {
    snapshot();
    const s = { id: uid(), type: 'marker', x: round1(p.x), y: round1(p.y), color: state.color, size: state.size, note: newNote() };
    img.shapes.push(s);
    state.selectedId = s.id;
    afterChange();
    focusNote(s.id, true);
    return;
  }

  stage.setPointerCapture(e.pointerId);
  const base = { id: uid(), type: t, color: state.color, size: state.size };
  if (state.dash && DASHABLE.has(t)) base.dash = true;
  if (t === 'pen') drawing = { ...base, points: [[p.x, p.y]] };
  else if (t === 'line' || t === 'arrow') drawing = { ...base, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
  else drawing = { ...base, x: p.x, y: p.y, w: 0, h: 0 };
  if (NOTE_TYPES.has(t)) drawing.note = newNote();
  render();
});

function snapLine(x1, y1, x, y) {
  const ang = Math.round(Math.atan2(y - y1, x - x1) / (Math.PI / 4)) * (Math.PI / 4);
  const len = Math.hypot(x - x1, y - y1);
  return { x: x1 + len * Math.cos(ang), y: y1 + len * Math.sin(ang) };
}

stage.addEventListener('pointermove', (e) => {
  if (panning) {
    state.view.x = panning.vx + e.clientX - panning.sx;
    state.view.y = panning.vy + e.clientY - panning.sy;
    applyView();
    return;
  }
  const img = cur();
  if (!img) return;
  const p = toImg(e);

  if (cropping) {
    crop.w = clamp(p.x, 0, img.w) - crop.x;
    crop.h = clamp(p.y, 0, img.h) - crop.y;
    updateCropBar();
    render();
    return;
  }
  if (resizing) {
    const s = img.shapes.find((x) => x.id === resizing.id);
    if (!s) return;
    if (!resizing.moved) { snapshot(); resizing.moved = true; }
    let q = p;
    if (e.shiftKey && resizing.handle === 'p2') q = snapLine(s.x1, s.y1, p.x, p.y);
    if (e.shiftKey && resizing.handle === 'p1') q = snapLine(s.x2, s.y2, p.x, p.y);
    applyResize(s, resizing, q, e.shiftKey);
    render();
    return;
  }
  if (dragging) {
    const s = img.shapes.find((x) => x.id === dragging.id);
    if (!s) return;
    if (!dragging.moved) { snapshot(); dragging.moved = true; }
    moveShape(s, p.x - dragging.last.x, p.y - dragging.last.y);
    dragging.last = p;
    render();
    return;
  }
  if (!drawing) {
    // Hover feedback for resize handles in select mode.
    if (state.tool === 'select') {
      const sel = selected();
      const h = sel && handleAt(sel, p);
      stage.style.cursor = h ? (h.key === 'nw' || h.key === 'se' ? 'nwse-resize' : h.key === 'ne' || h.key === 'sw' ? 'nesw-resize' : 'move') : '';
    }
    return;
  }
  const d = drawing;
  if (d.type === 'pen') {
    const last = d.points[d.points.length - 1];
    if (Math.hypot(p.x - last[0], p.y - last[1]) > 1.5 * unitOf(img)) d.points.push([p.x, p.y]);
  } else if (d.type === 'line' || d.type === 'arrow') {
    const q = e.shiftKey ? snapLine(d.x1, d.y1, p.x, p.y) : p;
    d.x2 = q.x;
    d.y2 = q.y;
  } else {
    d.w = p.x - d.x;
    d.h = p.y - d.y;
    if (e.shiftKey) {
      const m = Math.max(Math.abs(d.w), Math.abs(d.h));
      d.w = Math.sign(d.w || 1) * m;
      d.h = Math.sign(d.h || 1) * m;
    }
  }
  render();
});

function endPointer() {
  if (panning) { panning = null; stage.classList.remove('panning'); return; }
  if (cropping) {
    cropping = false;
    crop = norm(crop);
    if (crop.w < 8 || crop.h < 8) crop = null;
    updateCropBar();
    render();
    return;
  }
  if (resizing) {
    const img = cur();
    const s = img && img.shapes.find((x) => x.id === resizing.id);
    const moved = resizing.moved;
    resizing = null;
    if (s && moved) { finalize(s); afterChange(); }
    return;
  }
  if (dragging) {
    const moved = dragging.moved;
    dragging = null;
    if (moved) { updatePrompt(); scheduleSave(); }
    return;
  }
  if (!drawing) return;
  const img = cur();
  const d = drawing;
  drawing = null;
  if (!img || isTiny(d, unitOf(img))) { render(); return; }
  finalize(d);
  snapshot();
  img.shapes.push(d);
  state.selectedId = d.id;
  afterChange();
  if (NOTE_TYPES.has(d.type)) focusNote(d.id, false);
}
stage.addEventListener('pointerup', endPointer);
stage.addEventListener('pointercancel', endPointer);

stage.addEventListener('dblclick', (e) => {
  const img = cur();
  if (!img || state.tool !== 'select') return;
  const hit = hitTest(img, toImg(e));
  if (hit && hit.type === 'text') startTextEdit(hit, null);
  else if (hit && NOTE_TYPES.has(hit.type)) focusNote(hit.id, true);
});

stage.addEventListener('wheel', (e) => {
  if (!cur()) return;
  e.preventDefault();
  const r = stage.getBoundingClientRect();
  if (e.shiftKey && !e.ctrlKey) { state.view.x -= e.deltaY; applyView(); return; }
  zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015));
}, { passive: false });

/* ---------- text tool ---------- */

function startTextEdit(shape, p) {
  const img = cur();
  editingText = shape
    ? { id: shape.id, x: shape.x, y: shape.y, fontSize: shape.fontSize, color: shape.color }
    : { id: null, x: p.x, y: p.y, fontSize: fontSizeFor(state.size, unitOf(img)), color: state.color };
  textInput.value = shape ? shape.text : '';
  textInput.hidden = false;
  positionTextInput();
  render();
  setTimeout(() => textInput.focus(), 0);
}

function positionTextInput() {
  const et = editingText;
  const r = canvas.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const sc = r.width / canvas.width;
  textInput.style.left = r.left - sr.left + et.x * sc + 'px';
  textInput.style.top = r.top - sr.top + et.y * sc + 'px';
  textInput.style.fontSize = et.fontSize * sc + 'px';
  textInput.style.color = et.color === '#ffffff' ? '#111111' : et.color;
  sizeTextInput();
}

function sizeTextInput() {
  const lines = textInput.value.split('\n');
  textInput.rows = Math.max(1, lines.length);
  textInput.cols = Math.max(6, ...lines.map((l) => l.length + 2));
}

function finishTextEdit(commit) {
  if (!editingText) return;
  const et = editingText;
  editingText = null;
  textInput.hidden = true;
  const img = cur();
  const text = textInput.value.replace(/\s+$/, '');
  if (commit && img) {
    if (et.id) {
      const s = img.shapes.find((x) => x.id === et.id);
      if (s && !text) { snapshot(); img.shapes = img.shapes.filter((x) => x !== s); }
      else if (s && text !== s.text) { snapshot(); s.text = text; }
    } else if (text) {
      snapshot();
      const s = { id: uid(), type: 'text', x: round1(et.x), y: round1(et.y), text, fontSize: et.fontSize, color: et.color, size: state.size };
      img.shapes.push(s);
      state.selectedId = s.id;
    }
  }
  afterChange();
}

textInput.addEventListener('input', sizeTextInput);
textInput.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishTextEdit(true); }
  else if (e.key === 'Escape') { e.preventDefault(); finishTextEdit(false); }
});
textInput.addEventListener('blur', () => finishTextEdit(true));

/* ---------- note panel ---------- */

function focusNote(id, focusText) {
  const card = document.querySelector(`.note[data-id="${id}"]`);
  if (!card) return;
  card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (focusText) card.querySelector('textarea').focus({ preventScroll: true });
}

function makeSelect(options, value, onChange, title) {
  const sel = document.createElement('select');
  sel.title = title;
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  }
  sel.value = value;
  sel.addEventListener('change', () => onChange(sel.value, sel));
  return sel;
}

const autoGrow = (ta) => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; };

function renderNotes() {
  const img = cur();
  const box = $('#notes');
  box.textContent = '';
  const items = img ? img.shapes.filter((s) => NOTE_TYPES.has(s.type)) : [];
  $('#markCount').textContent = items.length ? String(items.length) : '';
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'notes-empty';
    empty.innerHTML = icon('marks');
    const p = document.createElement('div');
    p.textContent = img
      ? 'Drop a pin (M) or draw a box (R) on the image. Each mark gets a number and a note here.'
      : 'Add an image to start marking.';
    empty.appendChild(p);
    box.appendChild(empty);
    updatePrompt();
    return;
  }
  const nums = numbering(img);
  for (const s of items) {
    if (!s.note) s.note = newNote();
    const card = document.createElement('div');
    card.className = 'note' + (s.id === state.selectedId ? ' selected' : '');
    card.dataset.id = s.id;

    const head = document.createElement('div');
    head.className = 'note-head';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.style.background = s.color;
    badge.style.color = contrastOf(s.color);
    badge.textContent = nums.get(s.id);
    const type = document.createElement('span');
    type.className = 'note-type';
    type.textContent = TYPE_LABEL[s.type];
    const action = makeSelect(ACTIONS, s.note.action, (v) => { s.note.action = v; changedNote(); }, 'What to do');
    const prio = makeSelect(PRIORITIES, s.note.priority, (v, el) => {
      s.note.priority = v;
      el.className = `prio-${v}`;
      changedNote();
    }, 'Priority');
    prio.className = `prio-${s.note.priority}`;
    const del = document.createElement('button');
    del.className = 'note-del';
    del.innerHTML = icon('trash');
    del.title = 'Delete this mark';
    del.addEventListener('click', (e) => { e.stopPropagation(); deleteShape(s.id); });
    head.append(badge, type, action, prio, del);

    const ta = document.createElement('textarea');
    ta.rows = 2;
    ta.placeholder = 'What should change here?';
    ta.value = s.note.text;
    ta.addEventListener('input', () => { s.note.text = ta.value; autoGrow(ta); changedNote(); });

    card.append(head, ta);
    card.addEventListener('pointerdown', () => { if (state.selectedId !== s.id) selectShape(s.id, false); });
    box.appendChild(card);
    requestAnimationFrame(() => autoGrow(ta));
  }
  updatePrompt();
}

function changedNote() {
  updatePrompt();
  scheduleSave();
}

/* ---------- prompt builder ---------- */

const pct = (v) => clamp(Math.round(v * 100), 0, 100);

function zoneOf(fx, fy) {
  const v = fy < 1 / 3 ? 'top' : fy < 2 / 3 ? 'middle' : 'bottom';
  const h = fx < 1 / 3 ? 'left' : fx < 2 / 3 ? 'center' : 'right';
  if (v === 'middle' && h === 'center') return 'center';
  return `${v}-${h}`;
}

function describeWhere(s, img, unit) {
  const pt = (x, y) => `${zoneOf(x / img.w, y / img.h)} (x ${pct(x / img.w)}%, y ${pct(y / img.h)}%)`;
  if (s.type === 'marker') return `pin at ${pt(s.x, s.y)}`;
  if (s.type === 'line' || s.type === 'arrow') return `${TYPE_LABEL[s.type].toLowerCase()} from ${pt(s.x1, s.y1)} to ${pt(s.x2, s.y2)}`;
  const b = bboxOf(s, unit);
  const zone = zoneOf((b.x + b.w / 2) / img.w, (b.y + b.h / 2) / img.h);
  return `${TYPE_LABEL[s.type].toLowerCase()} around ${zone} (x ${pct(b.x / img.w)}–${pct((b.x + b.w) / img.w)}%, y ${pct(b.y / img.h)}–${pct((b.y + b.h) / img.h)}%)`;
}

function buildPrompt() {
  const imgs = state.images;
  if (!imgs.length) return '';
  const preset = PRESETS[state.preset] || PRESETS.general;
  const many = imgs.length > 1;
  const out = [];
  out.push(`# ${preset.label}`);
  out.push('');
  if (state.goal.trim()) { out.push(`**Goal:** ${state.goal.trim()}`); out.push(''); }
  out.push(preset.intro);
  out.push(
    `${many ? `I attached ${imgs.length} images, in the order below.` : 'I attached one image.'} ` +
    'Each number in this list matches a numbered mark on the image. Positions are % of image width (x) and height (y) from the top-left corner. ' +
    'Work through the items in order of priority. If anything is unclear, ask me before guessing.'
  );
  imgs.forEach((img, i) => {
    const unit = unitOf(img);
    const nums = numbering(img);
    out.push('');
    out.push(`## ${many ? `Image ${i + 1}: ` : ''}${img.name} (${img.w}×${img.h} px)`);
    if (img.note && img.note.trim()) out.push(`**Context:** ${img.note.trim()}`);
    const marks = img.shapes.filter((s) => NOTE_TYPES.has(s.type));
    if (marks.length) {
      out.push('');
      for (const s of marks) {
        const n = s.note || newNote();
        const text = n.text.trim() || '(no note: see the drawing)';
        out.push(`${nums.get(s.id)}. **${n.action.toUpperCase()}** · ${n.priority} priority · ${describeWhere(s, img, unit)}`);
        out.push(`   ${text.replace(/\n/g, '\n   ')}`);
      }
    } else {
      out.push('', '(No numbered marks on this image.)');
    }
    const texts = img.shapes.filter((s) => s.type === 'text' && s.text.trim());
    if (texts.length) {
      out.push('', 'Text labels I wrote on the image:');
      for (const s of texts) out.push(`- "${s.text.trim().replace(/\n/g, ' ')}" at ${zoneOf(s.x / img.w, s.y / img.h)}`);
    }
    const blurs = img.shapes.filter((s) => s.type === 'blur').length;
    if (blurs) out.push('', `${blurs} pixelated area${blurs > 1 ? 's are' : ' is'} hidden for privacy. Ignore ${blurs > 1 ? 'them' : 'it'}.`);
  });
  return out.join('\n');
}

function updatePrompt() {
  $('#promptPreview').textContent = buildPrompt() || 'Add an image to see the prompt.';
}

/* ---------- export ---------- */

const canvasToBlob = (c) => new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));

async function copyImage() {
  const img = cur();
  if (!img) return toast('Add an image first', true);
  finishTextEdit(true);
  try {
    if (!window.ClipboardItem) throw new Error('no ClipboardItem');
    const blob = canvasToBlob(renderExportCanvas(img));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Image copied. Paste it into your AI chat, then copy the prompt.');
  } catch {
    toast('This browser blocked copying images. Use Download PNG.', true);
  }
}

async function copyPrompt() {
  if (!state.images.length) return toast('Add an image first', true);
  finishTextEdit(true);
  try {
    await navigator.clipboard.writeText(buildPrompt());
    toast('Prompt copied. Paste it under the image.');
  } catch {
    toast('Clipboard blocked. Use Download Markdown.', true);
  }
}

async function downloadPngs() {
  if (!state.images.length) return toast('Add an image first', true);
  finishTextEdit(true);
  const list = state.images.length > 1 && confirm(`Download all ${state.images.length} images? (Cancel = only this one)`)
    ? state.images : [cur()];
  for (const img of list) {
    const blob = await canvasToBlob(renderExportCanvas(img));
    const n = state.images.indexOf(img) + 1;
    download(blob, `${String(n).padStart(2, '0')}-${slug(img.name)}-marked.png`);
  }
}

function downloadMd() {
  if (!state.images.length) return toast('Add an image first', true);
  download(new Blob([buildPrompt()], { type: 'text/markdown' }), 'prompt.md');
}

/* ---------- project save / load ---------- */

function serialize() {
  return {
    app: 'mark2prompt',
    version: 2,
    goal: state.goal,
    current: state.current,
    settings: { preset: state.preset, legend: state.legend },
    images: state.images.map(({ name, src, w, h, note, shapes }) => ({ name, src, w, h, note, shapes })),
  };
}

const num = (v) => (Number.isFinite(+v) ? +v : 0);

function sanitizeShape(s) {
  if (!s || typeof s !== 'object' || !SHAPE_TYPES.has(s.type)) return null;
  const o = {
    id: uid(), type: s.type,
    color: /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#ef4444',
    size: clamp(num(s.size) || 4, 1, 20),
  };
  if (s.dash && DASHABLE.has(s.type)) o.dash = true;
  if (s.type === 'pen') {
    if (!Array.isArray(s.points)) return null;
    o.points = s.points.filter(Array.isArray).map(([x, y]) => [num(x), num(y)]);
    if (!o.points.length) return null;
  } else if (s.type === 'line' || s.type === 'arrow') {
    Object.assign(o, { x1: num(s.x1), y1: num(s.y1), x2: num(s.x2), y2: num(s.y2) });
  } else if (s.type === 'marker') {
    Object.assign(o, { x: num(s.x), y: num(s.y) });
  } else if (s.type === 'text') {
    Object.assign(o, { x: num(s.x), y: num(s.y), text: String(s.text || ''), fontSize: clamp(num(s.fontSize) || 20, 6, 400) });
  } else {
    Object.assign(o, { x: num(s.x), y: num(s.y), w: num(s.w), h: num(s.h) });
  }
  if (NOTE_TYPES.has(o.type)) {
    const n = s.note || {};
    o.note = {
      action: ACTIONS.includes(n.action) ? n.action : 'Change',
      priority: PRIORITIES.includes(n.priority) ? n.priority : 'Medium',
      text: String(n.text || ''),
    };
  }
  return o;
}

async function loadSerialized(data) {
  if (!data || !Array.isArray(data.images)) throw new Error('Not a Mark2Prompt project');
  const images = [];
  for (const r of data.images) {
    if (typeof r.src !== 'string' || !r.src.startsWith('data:image/')) continue;
    try {
      const el = await loadImageEl(r.src);
      const rec = {
        id: uid(), name: String(r.name || 'Image'), src: r.src,
        w: el.naturalWidth, h: el.naturalHeight, note: String(r.note || ''),
        shapes: (Array.isArray(r.shapes) ? r.shapes : []).map(sanitizeShape).filter(Boolean),
        undo: [], redo: [],
      };
      imgCache.set(rec.id, el);
      images.push(rec);
    } catch { /* skip broken image */ }
  }
  for (const id of [...imgCache.keys()]) if (!images.some((i) => i.id === id)) imgCache.delete(id);
  state.images = images;
  state.goal = String(data.goal || '');
  $('#goal').value = state.goal;
  if (data.settings) {
    if (PRESETS[data.settings.preset]) state.preset = data.settings.preset;
    state.legend = !!data.settings.legend;
    $('#preset').value = state.preset;
    $('#legend').checked = state.legend;
  }
  const c = Number.isInteger(data.current) ? data.current : 0;
  switchImage(images.length ? clamp(c, 0, images.length - 1) : -1);
}

async function openProjectFile(f) {
  try {
    const data = JSON.parse(await f.text());
    if (state.images.length && !confirm('Replace the current project with this file?')) return;
    await loadSerialized(data);
    scheduleSave();
    toast('Project opened');
  } catch {
    toast('That file is not a valid project', true);
  }
}

function saveProjectFile() {
  if (!state.images.length) return toast('Nothing to save yet', true);
  finishTextEdit(true);
  download(new Blob([JSON.stringify(serialize())], { type: 'application/json' }), 'mark2prompt-project.json');
  toast('Project file saved');
}

function newProject() {
  if (state.images.length && !confirm('Start a new project? Unsaved marks will be lost.')) return;
  state.images = [];
  state.goal = '';
  $('#goal').value = '';
  imgCache.clear();
  switchImage(-1);
  scheduleSave();
}

/* ---------- autosave (IndexedDB, this browser only) ---------- */

const DB_NAME = 'mark2prompt';
const STORE = 'kv';

function idbOpen() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => { db.close(); res(); };
    tx.onerror = () => { db.close(); rej(tx.error); };
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => { db.close(); res(r.result); };
    r.onerror = () => { db.close(); rej(r.error); };
  });
}

let saveTimer;
function scheduleSave() {
  clearTimeout(saveTimer);
  $('#stSave').textContent = 'Saving…';
  saveTimer = setTimeout(async () => {
    try {
      await idbSet('project', serialize());
      $('#stSave').textContent = 'All changes saved in this browser';
    } catch {
      $('#stSave').textContent = 'Autosave unavailable: use Save';
    }
  }, 600);
}

/* ---------- chrome: toolbar, inspector, status ---------- */

function updateChrome() {
  const img = cur();
  const s = selected();
  $('#styleHint').textContent = s ? `Editing ${TYPE_LABEL[s.type].toLowerCase()}` : 'For new marks';
  $('#styleHint').classList.toggle('on', !!s);
  if (s) {
    markColor(s.color);
    $('#size').value = s.size;
    $('#sizeValue').textContent = s.size;
    markDash(!!s.dash);
  } else {
    markColor(state.color);
    $('#size').value = state.size;
    $('#sizeValue').textContent = state.size;
    markDash(state.dash);
  }
  $('#btnUndo').disabled = !img || !img.undo.length;
  $('#btnRedo').disabled = !img || !img.redo.length;
  $('#btnDuplicate').disabled = !s;
  $('#btnDelete').disabled = !s;
  const n = img ? img.shapes.filter((x) => NOTE_TYPES.has(x.type)).length : 0;
  $('#stImage').textContent = img ? `${img.name} · ${img.w} × ${img.h} px` : 'No image';
  $('#stMarks').textContent = img ? `${n} mark${n === 1 ? '' : 's'}` : '';
}

function markColor(c) {
  $$('.swatch[data-color]').forEach((b) => b.classList.toggle('active', b.dataset.color.toLowerCase() === String(c).toLowerCase()));
  $('#customColor').value = c;
}

function markDash(on) {
  $$('#strokeStyle button').forEach((b) => b.classList.toggle('active', (b.dataset.dash === '1') === on));
}

function setTool(t) {
  finishTextEdit(true);
  if (state.tool === 'crop' && t !== 'crop') crop = null;
  state.tool = t;
  stage.dataset.tool = t;
  stage.style.cursor = '';
  $$('#tools .tool').forEach((b) => b.classList.toggle('active', b.dataset.tool === t));
  updateCropBar();
  render();
}

function setColor(c) {
  const s = selected();
  if (s) {
    if (s.color !== c) { snapshot(); s.color = c; afterChange(); }
  } else {
    state.color = c;
  }
  markColor(c);
}

function setDash(on) {
  const s = selected();
  if (s && DASHABLE.has(s.type)) {
    if (!!s.dash !== on) { snapshot(); s.dash = on || undefined; afterChange(); }
  } else {
    state.dash = on;
  }
  markDash(on);
}

function toggleMarks(force) {
  state.hideMarks = typeof force === 'boolean' ? force : !state.hideMarks;
  const b = $('#btnToggleMarks');
  b.innerHTML = icon(state.hideMarks ? 'eyeoff' : 'eye');
  b.classList.toggle('active', state.hideMarks);
  b.dataset.tip = state.hideMarks ? 'Show marks · O' : 'Hide marks · O';
  render();
}

const THEMES = ['system', 'light', 'dark'];
function applyTheme(t) {
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
  const b = $('#btnTheme');
  b.innerHTML = icon(t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'monitor');
  b.dataset.tip = `Theme: ${t}`;
  safeStorage(() => localStorage.setItem('m2p-theme', t));
}

/* Tooltips: one floating element, so tool rails with overflow do not clip them. */
const tip = $('#tip');
document.addEventListener('pointerover', (e) => {
  const el = e.target.closest('[data-tip]');
  if (!el || e.pointerType === 'touch') { tip.hidden = true; return; }
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  const pos = el.dataset.tipPos || 'bottom';
  let x, y;
  if (pos === 'right') { x = r.right + 8; y = r.top + r.height / 2 - t.height / 2; }
  else if (pos === 'top') { x = r.left + r.width / 2 - t.width / 2; y = r.top - t.height - 8; }
  else { x = r.left + r.width / 2 - t.width / 2; y = r.bottom + 8; }
  tip.style.left = clamp(x, 6, innerWidth - t.width - 6) + 'px';
  tip.style.top = clamp(y, 6, innerHeight - t.height - 6) + 'px';
});
document.addEventListener('pointerout', (e) => {
  if (e.target.closest('[data-tip]') && !e.relatedTarget?.closest?.('[data-tip]')) tip.hidden = true;
});
document.addEventListener('pointerdown', () => { tip.hidden = true; }, true);

/* ---------- wiring ---------- */

$$('#tools .tool').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
$$('.swatch[data-color]').forEach((b) => b.addEventListener('click', () => setColor(b.dataset.color)));
$('#customColor').addEventListener('input', (e) => setColor(e.target.value));
$$('#strokeStyle button').forEach((b) => b.addEventListener('click', () => setDash(b.dataset.dash === '1')));

const sizeInput = $('#size');
let sizeSnapshotTaken = false;
sizeInput.addEventListener('input', () => {
  const v = +sizeInput.value;
  $('#sizeValue').textContent = v;
  const img = cur();
  const s = selected();
  if (s) {
    if (!sizeSnapshotTaken) { snapshot(); sizeSnapshotTaken = true; }
    s.size = v;
    if (s.type === 'text') s.fontSize = fontSizeFor(v, unitOf(img));
    render();
  } else {
    state.size = v;
  }
});
sizeInput.addEventListener('change', () => { sizeSnapshotTaken = false; scheduleSave(); updateChrome(); });

const presetSel = $('#preset');
for (const [key, p] of Object.entries(PRESETS)) {
  const o = document.createElement('option');
  o.value = key;
  o.textContent = p.label;
  presetSel.appendChild(o);
}
presetSel.addEventListener('change', () => {
  state.preset = presetSel.value;
  safeStorage(() => localStorage.setItem('m2p-preset', state.preset));
  updatePrompt();
  scheduleSave();
});
$('#legend').addEventListener('change', (e) => { state.legend = e.target.checked; scheduleSave(); });

$('#btnUndo').addEventListener('click', undo);
$('#btnRedo').addEventListener('click', redo);
$('#btnDuplicate').addEventListener('click', duplicateSelected);
$('#btnDelete').addEventListener('click', deleteSelected);
$('#btnFit').addEventListener('click', fitView);
$('#btnZoomIn').addEventListener('click', () => zoomCenter(1.25));
$('#btnZoomOut').addEventListener('click', () => zoomCenter(1 / 1.25));
$('#zoomInfo').addEventListener('click', () => zoomCenter(1 / state.view.scale));
$('#btnToggleMarks').addEventListener('click', () => toggleMarks());
$('#btnCropApply').addEventListener('click', applyCrop);
$('#btnCropCancel').addEventListener('click', () => { cancelCrop(); setTool('select'); });
$('#btnOpen').addEventListener('click', () => $('#fileInput').click());
$('#btnEmptyOpen').addEventListener('click', () => $('#fileInput').click());
$('#btnSaveProject').addEventListener('click', saveProjectFile);
$('#btnNew').addEventListener('click', newProject);
$('#btnHelp').addEventListener('click', () => $('#help').showModal());
$('#btnTheme').addEventListener('click', () => {
  const now = document.documentElement.dataset.theme || 'system';
  applyTheme(THEMES[(THEMES.indexOf(now) + 1) % THEMES.length]);
});
$('#btnCopyImage').addEventListener('click', copyImage);
$('#btnCopyPrompt').addEventListener('click', copyPrompt);
$('#btnDownloadPng').addEventListener('click', downloadPngs);
$('#btnDownloadMd').addEventListener('click', downloadMd);
$('#btnPreview').addEventListener('click', () => {
  const pre = $('#promptPreview');
  pre.hidden = !pre.hidden;
  $('#btnPreview span').textContent = pre.hidden ? 'Preview' : 'Hide';
});

$('#fileInput').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  await handleFiles(files);
});

$('#goal').addEventListener('input', (e) => { state.goal = e.target.value; updatePrompt(); scheduleSave(); });
$('#imgNote').addEventListener('input', (e) => {
  const img = cur();
  if (img) { img.note = e.target.value; updatePrompt(); scheduleSave(); }
});

/* ---------- keyboard, paste, drop ---------- */

document.addEventListener('keydown', (e) => {
  const el = e.target;
  const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
  const mod = e.ctrlKey || e.metaKey;
  const k = e.key.toLowerCase();
  if (mod && k === 's') { e.preventDefault(); saveProjectFile(); return; }
  if (typing || $('#help').open) return;
  if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
  if (mod && k === 'y') { e.preventDefault(); redo(); return; }
  if (mod && k === 'd') { e.preventDefault(); duplicateSelected(); return; }
  if (mod || e.altKey) return;
  if (e.key === ' ') {
    e.preventDefault();
    if (!spaceDown) { spaceDown = true; stage.classList.add('can-pan'); }
    return;
  }
  if (state.tool === 'crop' && crop && e.key === 'Enter') { e.preventDefault(); applyCrop(); return; }
  if (e.key === 'Escape') {
    if (state.tool === 'crop') { cancelCrop(); setTool('select'); } else selectShape(null);
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); return; }
  const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (arrows[e.key] && selected()) {
    e.preventDefault();
    const step = (e.shiftKey ? 10 : 1) * unitOf(cur());
    nudge(arrows[e.key][0] * step, arrows[e.key][1] * step);
    return;
  }
  if (e.key === '?') { $('#help').showModal(); return; }
  if (e.key === '0') { fitView(); return; }
  if (e.key === '+' || e.key === '=') { zoomCenter(1.25); return; }
  if (e.key === '-') { zoomCenter(1 / 1.25); return; }
  if (k === 'o') { toggleMarks(); return; }
  if (TOOL_KEYS[k]) setTool(TOOL_KEYS[k]);
});

document.addEventListener('keyup', (e) => {
  if (e.key === ' ') { spaceDown = false; stage.classList.remove('can-pan'); }
});

document.addEventListener('paste', (e) => {
  const items = [...((e.clipboardData && e.clipboardData.items) || [])];
  const files = items.filter((i) => i.kind === 'file' && i.type.startsWith('image/')).map((i) => i.getAsFile()).filter(Boolean);
  if (!files.length) return;
  e.preventDefault();
  files.forEach((f, i) => addImage(f, files.length > 1 ? `Pasted image ${i + 1}` : `Screenshot ${state.images.length + 1}`));
});

let dragDepth = 0;
document.addEventListener('dragenter', (e) => {
  if (!e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return;
  e.preventDefault();
  dragDepth++;
  stage.classList.add('drag-over');
});
document.addEventListener('dragover', (e) => {
  if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault();
});
document.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) stage.classList.remove('drag-over');
});
document.addEventListener('drop', (e) => {
  dragDepth = 0;
  stage.classList.remove('drag-over');
  if (!e.dataTransfer || !e.dataTransfer.files.length) return;
  e.preventDefault();
  handleFiles([...e.dataTransfer.files]);
});

let resizeTimer;
window.addEventListener('resize', () => {
  if (editingText) positionTextInput();
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fitView, 150);
});

/* ---------- start ---------- */

(async function init() {
  paintIcons();
  applyTheme(safeStorage(() => localStorage.getItem('m2p-theme'), null) || 'system');
  const savedPreset = safeStorage(() => localStorage.getItem('m2p-preset'), null);
  if (PRESETS[savedPreset]) state.preset = savedPreset;
  presetSel.value = state.preset;
  toggleMarks(false);
  setTool('marker');
  renderTabs();
  renderNotes();
  updateChrome();
  try {
    const saved = await idbGet('project');
    if (saved && Array.isArray(saved.images) && saved.images.length) {
      await loadSerialized(saved);
      $('#stSave').textContent = 'Restored your last session';
    }
  } catch { /* first visit or storage blocked */ }
})();
