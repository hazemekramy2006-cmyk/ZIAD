/* ============================================================
   data.js — project data + procedural cinematic frame painting
   Every poster in the site is painted here: no image assets.
   ============================================================ */

export const PROJECTS = [
  {
    id: 'nocturne',
    title: 'NOCTURNE',
    category: 'Short Film',
    year: '2025',
    badge: 'OFFICIAL SELECTION',
    variant: 'skyline',
    palette: ['#0a1024', '#16264d', '#ff8a3d', '#ffd9a0'],
    desc: 'Twelve minutes inside a city that refuses to sleep — anamorphic night exteriors, one continuous sound design spine.',
    long: 'A insomnia study built from three months of night pickups. The edit holds on silence longer than comfort allows, then releases into a single unbroken move through the avenue. Shot wide open at T1.4, graded toward sodium-vapour amber against deep cyan shadows.',
    client: 'Independent', role: 'Director / Editor', duration: '12:40',
    format: '4K · 2.39:1', tools: 'Premiere Pro, DaVinci Resolve', award: 'Cairo Film Nights — Selection',
    delivery: 'DCP, ProRes 422 HQ'
  },
  {
    id: 'atlas',
    title: 'ATLAS RISING',
    category: 'Brand Film',
    year: '2025',
    badge: 'CLIENT FILM',
    variant: 'peaks',
    palette: ['#101827', '#2b3f63', '#ffb45c', '#ffe9cf'],
    desc: 'A six-minute origin film for an outdoor label — landscapes cut to a breathing rhythm, never to the beat.',
    long: 'No voice-over, no product until minute four. The film earns the brand by first earning the landscape: altitude, weather, distance. Cut on breath and wind rather than music, with the score entering only when the summit does.',
    client: 'Atlas Outdoor', role: 'Director / DOP', duration: '06:12',
    format: '6K · 16:9', tools: 'Premiere Pro, After Effects', award: 'Brand Film Awards — Shortlist',
    delivery: 'Broadcast master, 9 socials'
  },
  {
    id: 'kinetic',
    title: 'KINETIC',
    category: 'Music Video',
    year: '2024',
    badge: '1.4M VIEWS',
    variant: 'road',
    palette: ['#120a1c', '#3a1350', '#ff2f6d', '#ffd1e3'],
    desc: 'One night, one road, forty edits in the final ninety seconds — a study in controlled acceleration.',
    long: 'The track never repeats a bar, so neither did the cut. Every transition is motivated by a light source passing frame: headlights, signage, a strobe through a windscreen. Speed ramps are baked in-camera; the timeline only sharpens them.',
    client: 'NOVA / Black Wax Rec.', role: 'Editor / Colourist', duration: '03:31',
    format: '4K · 2.39:1', tools: 'After Effects, CapCut, Resolve', award: '—',
    delivery: 'Vertical + 16:9 masters'
  },
  {
    id: 'lastframe',
    title: 'THE LAST FRAME',
    category: 'Documentary',
    year: '2024',
    badge: 'FEATURE · 74 MIN',
    variant: 'arches',
    palette: ['#0d0c0a', '#2c261d', '#f0b429', '#fff2d4'],
    desc: 'The final surviving projectionist of a single-screen cinema, told through the machine he refuses to retire.',
    long: 'Seventy-four minutes assembled from 62 hours of material. The structure mirrors a reel change: three acts, two blackouts, one intermission. All archival scans were stabilised frame by frame and regraded from original lab prints.',
    client: 'Ministry of Culture', role: 'Director / Editor', duration: '74:00',
    format: '2K · 1.85:1', tools: 'Premiere Pro, DaVinci Resolve', award: 'Documentary Forum — Best Edit',
    delivery: 'DCP, festival package'
  },
  {
    id: 'velvet',
    title: 'VELVET HOURS',
    category: 'Fashion Film',
    year: '2025',
    badge: 'CAMPAIGN',
    variant: 'studio',
    palette: ['#140b12', '#3d1a2e', '#ff6a8a', '#ffd9e2'],
    desc: 'A studio built entirely from light — no set dressing, only moving sources and a camera that never stops.',
    long: 'Eleven lighting cues rehearsed like choreography: each garment reveal is a lighting change, not a cut. The camera drifts on a slow dolly while the editor lets the fabric do the talking. One take per look, twenty-two looks.',
    client: 'Maison Verre', role: 'Editor / Motion', duration: '01:48',
    format: '4K · 4:5 + 16:9', tools: 'After Effects, CapCut', award: '—',
    delivery: 'Campaign film, 6 cutdowns'
  },
  {
    id: 'signal',
    title: 'SIGNAL',
    category: 'Title Sequence',
    year: '2026',
    badge: 'BROADCAST',
    variant: 'signal',
    palette: ['#05070d', '#0e1a2b', '#e5241b', '#ffd7d4'],
    desc: 'Forty seconds of broadcast identity: scan-lines, type in motion, and one red pulse that never resolves.',
    long: 'A title sequence for a documentary series about encrypted history. Every glyph is animated on a 12-frame grid so the type reads as machine output, while the red pulse drifts off-grid to keep the sequence human.',
    client: 'Channel Eight', role: 'Motion Designer', duration: '00:40',
    format: '4K · 16:9', tools: 'After Effects, Cinema 4D', award: 'Motion Awards — Finalist',
    delivery: 'Broadcast IDs, bumpers'
  }
];

/* ---------------- deterministic random ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = (seed) => mulberry32(seed);

function sky(ctx, w, h, p) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, p[0]);
  g.addColorStop(0.55, p[1]);
  g.addColorStop(1, '#05050a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function glow(ctx, x, y, r, color, alpha = 0.85) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, alpha));
  g.addColorStop(0.35, hexA(color, alpha * 0.34));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function haze(ctx, w, h, y, color) {
  const g = ctx.createLinearGradient(0, y - h * 0.22, 0, y + h * 0.1);
  g.addColorStop(0, hexA(color, 0));
  g.addColorStop(0.5, hexA(color, 0.22));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, y - h * 0.22, w, h * 0.32);
}

function vignette(ctx, w, h, s = 0.75) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.18, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${s})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function grain(ctx, w, h, amount = 0.055, count = 3600) {
  ctx.save();
  ctx.globalAlpha = amount;
  for (let i = 0; i < count; i++) {
    const v = Math.random() * 255 | 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
  }
  ctx.restore();
}

function flare(ctx, w, h, x, y, color) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  glow(ctx, x, y, Math.max(w, h) * 0.3, color, 0.5);
  const g = ctx.createLinearGradient(0, y, w, y);
  g.addColorStop(0, hexA(color, 0));
  g.addColorStop(0.5, hexA(color, 0.3));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 2, w, 4);
  for (let i = 1; i <= 3; i++) {
    const cx = x + (w / 2 - x) * (i * 0.42);
    const cy = y + (h / 2 - y) * (i * 0.42);
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * (0.02 + i * 0.016), 0, 6.3);
    ctx.strokeStyle = hexA(color, 0.16 - i * 0.035);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- variants ---------------- */
function vSkyline(ctx, w, h, p, rnd) {
  glow(ctx, w * 0.66, h * 0.72, Math.max(w, h) * 0.5, p[2], 0.55);
  const horizon = h * 0.78;
  const layers = [
    { c: hexA(p[1], 0.85), base: horizon, min: 0.14, max: 0.3 },
    { c: '#0a0d18', base: horizon + h * 0.04, min: 0.2, max: 0.42 }
  ];
  layers.forEach((L, li) => {
    let x = -20;
    ctx.fillStyle = L.c;
    while (x < w + 20) {
      const bw = (0.04 + rnd() * 0.08) * w;
      const bh = (L.min + rnd() * (L.max - L.min)) * h;
      ctx.fillRect(x, L.base - bh, bw, bh + h * 0.3);
      if (li === 1) {
        ctx.fillStyle = hexA(p[3], 0.5);
        for (let i = 0; i < 26; i++) {
          if (rnd() > 0.55) continue;
          const wx = x + 5 + rnd() * (bw - 12);
          const wy = L.base - bh + 8 + rnd() * (bh - 16);
          ctx.fillRect(wx, wy, 3, 4);
        }
        ctx.fillStyle = L.c;
      }
      x += bw + 3;
    }
  });
  haze(ctx, w, h, horizon, p[2]);
  ctx.fillStyle = 'rgba(4,4,9,.9)';
  ctx.fillRect(0, horizon + h * 0.13, w, h);
}

function vPeaks(ctx, w, h, p, rnd) {
  const sun = { x: w * 0.7, y: h * 0.42 };
  glow(ctx, sun.x, sun.y, Math.max(w, h) * 0.55, p[2], 0.7);
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, Math.min(w, h) * 0.075, 0, 6.3);
  ctx.fillStyle = hexA(p[3], 0.92);
  ctx.fill();
  const ranges = [
    { c: hexA(p[1], 0.9), base: h * 0.95, amp: 0.34, n: 7 },
    { c: '#0b1120', base: h * 1.02, amp: 0.5, n: 5 },
    { c: '#05070f', base: h * 1.08, amp: 0.62, n: 4 }
  ];
  ranges.forEach((r, i) => {
    ctx.beginPath();
    ctx.moveTo(-40, h + 40);
    const step = w / r.n;
    for (let k = 0; k <= r.n; k++) {
      const px = -40 + k * step + (rnd() - 0.5) * step * 0.4;
      const py = r.base - (0.35 + rnd() * 0.65) * h * r.amp;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w + 40, h + 40);
    ctx.closePath();
    ctx.fillStyle = r.c;
    ctx.fill();
    if (i === 0) {
      ctx.strokeStyle = hexA(p[3], 0.28);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
  haze(ctx, w, h, h * 0.78, p[2]);
}

function vRoad(ctx, w, h, p, rnd) {
  const vx = w * 0.5, vy = h * 0.56;
  glow(ctx, vx, vy, Math.max(w, h) * 0.42, p[2], 0.75);
  ctx.fillStyle = 'rgba(6,5,12,.92)';
  ctx.beginPath();
  ctx.moveTo(vx - w * 0.02, vy);
  ctx.lineTo(vx + w * 0.02, vy);
  ctx.lineTo(w * 1.25, h);
  ctx.lineTo(-w * 0.25, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hexA(p[3], 0.5);
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12, t1 = t0 + 0.05 + t0 * 0.04;
    const y0 = vy + (h - vy) * t0 * t0, y1 = vy + (h - vy) * t1 * t1;
    const x0 = vx + (0.5 + t0 * t0) * 0, x1 = vx;
    ctx.globalAlpha = 0.25 + t0 * 0.7;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    const y = vy + (h - vy) * t * t;
    const lx = vx - (w * 0.1 + t * w * 0.75);
    const rx = vx + (w * 0.1 + t * w * 0.75);
    ctx.fillStyle = hexA(p[2], 0.75 - t * 0.2);
    ctx.fillRect(lx - 2, y - 34 * (0.3 + t), 4, 40 * (0.3 + t));
    ctx.fillStyle = hexA(p[3], 0.55 - t * 0.2);
    ctx.fillRect(rx, y - 34 * (0.3 + t), 4, 40 * (0.3 + t));
  }
  haze(ctx, w, h, vy, p[2]);
}

function vArches(ctx, w, h, p, rnd) {
  glow(ctx, w * 0.5, h * 0.6, Math.max(w, h) * 0.5, p[2], 0.6);
  const n = 7;
  for (let i = n; i >= 1; i--) {
    const t = i / n;
    const aw = w * (0.16 + t * 0.72);
    const ah = h * (0.3 + t * 0.62);
    const x = (w - aw) / 2, y = h * 0.66 - ah;
    ctx.beginPath();
    ctx.moveTo(x, y + ah);
    ctx.lineTo(x, y + aw * 0.5);
    ctx.arc(x + aw / 2, y + aw * 0.5, aw / 2, Math.PI, 0);
    ctx.lineTo(x + aw, y + ah);
    ctx.closePath();
    ctx.lineWidth = Math.max(2, w * 0.012 * (1.15 - t));
    ctx.strokeStyle = hexA(i % 2 ? p[3] : p[1], 0.16 + (1 - t) * 0.55);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(8,7,5,.72)';
  ctx.fillRect(0, h * 0.66, w, h);
  const g = ctx.createLinearGradient(0, h * 0.66, 0, h);
  g.addColorStop(0, hexA(p[2], 0.35));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.66, w, h * 0.34);
}

function vSignal(ctx, w, h, p, rnd) {
  glow(ctx, w * 0.5, h * 0.5, Math.max(w, h) * 0.5, p[2], 0.3);
  ctx.strokeStyle = hexA(p[3], 0.14);
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  const cy = h * 0.5;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 3) {
    const k = x / w;
    const amp = h * 0.16 * Math.sin(k * Math.PI);
    const y = cy + Math.sin(k * 34 + rnd() * 0.02) * amp * (0.35 + 0.65 * Math.abs(Math.sin(k * 5)));
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = hexA(p[2], 0.9);
  ctx.lineWidth = Math.max(2, h * 0.006);
  ctx.shadowColor = p[2];
  ctx.shadowBlur = 26;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(w * 0.5, cy, Math.min(w, h) * 0.3, 0, 6.3);
  ctx.strokeStyle = hexA(p[3], 0.25);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = hexA(p[3], 0.9);
  ctx.font = `500 ${Math.max(10, h * 0.035)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('S I G N A L   —   0 1', w * 0.5, h * 0.86);
}

function vStudio(ctx, w, h, p, rnd) {
  glow(ctx, w * 0.74, h * 0.2, Math.max(w, h) * 0.5, p[2], 0.5);
  glow(ctx, w * 0.14, h * 0.66, Math.max(w, h) * 0.34, p[1], 0.75);
  ctx.fillStyle = 'rgba(6,4,8,.55)';
  ctx.fillRect(0, h * 0.74, w, h * 0.26);

  const cx = w * 0.46, cy = h * 0.46, s = w * 0.0016;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#050507';
  ctx.strokeStyle = hexA(p[3], 0.55);
  ctx.lineWidth = Math.max(1.4, w * 0.0035);

  const roundRect = (x, y, w2, h2, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w2, y, x + w2, y + h2, r);
    ctx.arcTo(x + w2, y + h2, x, y + h2, r);
    ctx.arcTo(x, y + h2, x, y, r);
    ctx.arcTo(x, y, x + w2, y, r);
    ctx.closePath();
  };

  // body
  roundRect(-110 * s, -70 * s, 220 * s, 140 * s, 14 * s);
  ctx.fill(); ctx.stroke();
  // top handle
  roundRect(-70 * s, -110 * s, 150 * s, 26 * s, 8 * s);
  ctx.fill(); ctx.stroke();
  // lens
  ctx.beginPath(); ctx.rect(110 * s, -34 * s, 130 * s, 68 * s);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(240 * s, 0, 34 * s, 0, 6.3);
  ctx.fillStyle = '#020204'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(240 * s, 0, 20 * s, 0, 6.3);
  ctx.fillStyle = hexA(p[2], 0.4); ctx.fill();
  // matte box flag
  ctx.beginPath(); ctx.moveTo(-30 * s, -110 * s); ctx.lineTo(150 * s, -140 * s);
  ctx.lineTo(150 * s, -126 * s); ctx.lineTo(-30 * s, -98 * s); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // tripod
  ctx.beginPath();
  ctx.moveTo(-6 * s, 70 * s); ctx.lineTo(-90 * s, 300 * s);
  ctx.moveTo(6 * s, 70 * s); ctx.lineTo(96 * s, 300 * s);
  ctx.moveTo(0, 70 * s); ctx.lineTo(14 * s, 300 * s);
  ctx.stroke();
  // rec dot
  ctx.beginPath(); ctx.arc(-78 * s, -44 * s, 8 * s, 0, 6.3);
  ctx.fillStyle = '#ff2f24'; ctx.fill();
  ctx.restore();

  haze(ctx, w, h, h * 0.7, p[2]);
}

const VARIANTS = {
  skyline: vSkyline, peaks: vPeaks, road: vRoad,
  arches: vArches, signal: vSignal, studio: vStudio
};

/**
 * Paint a cinematic frame into a canvas.
 */
export function renderPoster(canvas, opts = {}) {
  const {
    variant = 'skyline',
    seed = 1,
    palette = ['#0a1024', '#16264d', '#ff8a3d', '#ffd9a0']
  } = opts;
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const rnd = R(seed * 9973 + 17);

  ctx.clearRect(0, 0, w, h);
  sky(ctx, w, h, palette);
  (VARIANTS[variant] || vSkyline)(ctx, w, h, palette, rnd);
  flare(ctx, w, h, w * (0.35 + rnd() * 0.3), h * (0.34 + rnd() * 0.28), palette[2]);
  vignette(ctx, w, h, 0.72);
  grain(ctx, w, h, 0.05, Math.round(w * h / 340));

  // cinematic frame marks
  ctx.strokeStyle = 'rgba(255,255,255,.10)';
  ctx.lineWidth = Math.max(1, w * 0.0016);
  const m = w * 0.028, L = w * 0.03;
  [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y);
    ctx.stroke();
  });
  return canvas;
}

/** Paint an animated "playing" frame (ken-burns over a shot) into target. */
export function paintShot(target, shot, t) {
  const ctx = target.getContext('2d');
  const w = target.width, h = target.height;
  const zoom = 1.06 + t * 0.1;
  const px = Math.sin(t * Math.PI * 0.6) * w * 0.03;
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2 + px, h / 2 - t * h * 0.02);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);
  ctx.drawImage(shot, 0, 0, w, h);
  ctx.restore();
  // moving light sweep
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const x = (t * 1.4 - 0.2) * w;
  const g = ctx.createLinearGradient(x - w * 0.3, 0, x + w * 0.3, h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, 'rgba(255,235,220,.10)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  vignette(ctx, w, h, 0.55);
  grain(ctx, w, h, 0.05, 6000);
}

export function makeShot(p, seed, variant, w = 1600, h = 900) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  renderPoster(c, { variant, seed, palette: p });
  return c;
}
