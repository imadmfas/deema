import { h, btn } from '../ui.js';
import { sfx } from '../audio.js';

const W = 360, STEP = 8;
export function render(act, ctx) {
  const guide = h('canvas', { width: W, height: W, class: 'tr-guide' }), draw = h('canvas', { width: W, height: W, class: 'tr-draw' });
  const g = guide.getContext('2d'), d = draw.getContext('2d');
  const mask = document.createElement('canvas'); mask.width = mask.height = W; const m = mask.getContext('2d', { willReadFrequently: true });
  const font = act.kind === 'ar' ? '800 250px "Baloo Bhaijaan 2", sans-serif' : '800 280px "Baloo Bhaijaan 2", sans-serif';
  const path = () => {
    const p = new Path2D();
    if (act.shape === 'circle') p.arc(W / 2, W / 2, 120, 0, Math.PI * 2);
    else if (act.shape === 'square') p.rect(60, 60, 240, 240);
    else { p.moveTo(W / 2, 48); p.lineTo(312, 300); p.lineTo(48, 300); p.closePath(); }
    return p;
  };
  const place = c => { // رسم الحرف في مركز اللوحة
    c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.direction = act.kind === 'ar' ? 'rtl' : 'ltr';
    const mt = c.measureText(act.g); const asc = mt.actualBoundingBoxAscent || 150, dsc = mt.actualBoundingBoxDescent || 0;
    return [W / 2, W / 2 + (asc - dsc) / 2];
  };
  if (act.kind === 'shape') {
    const p = path(); g.lineWidth = 34; g.strokeStyle = '#e8ecf8'; g.lineJoin = 'round'; g.stroke(p); g.lineWidth = 3; g.setLineDash([2, 12]); g.strokeStyle = '#9aa6cc'; g.lineCap = 'round'; g.stroke(p);
    m.lineWidth = 36; m.lineJoin = 'round'; m.stroke(p);
  } else {
    const [x, y] = place(g); g.fillStyle = '#e8ecf8'; g.fillText(act.g, x, y); g.lineWidth = 3; g.setLineDash([2, 10]); g.strokeStyle = '#9aa6cc'; g.lineCap = 'round'; g.strokeText(act.g, x, y);
    const [x2, y2] = place(m); m.fillStyle = '#000'; m.fillText(act.g, x2, y2);
  }
  const md = m.getImageData(0, 0, W, W).data, pts = [];
  for (let y = 0; y < W; y += STEP) for (let x = 0; x < W; x += STEP) if (md[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
  const bar = h('div', { class: 'tr-bar' }, h('i'));
  let hue = 330, finished = false;
  const cover = () => { const dd = d.getImageData(0, 0, W, W).data; let c = 0; for (const [x, y] of pts) if (dd[(y * W + x) * 4 + 3] > 90) c++; return c / (pts.length || 1); };
  const upd = () => { const c = cover(); bar.firstChild.style.width = Math.min(100, c / .66 * 100) + '%'; if (c >= .66 && !finished) { finished = true; sfx('pop'); ctx.ok({ say: [{ s: act.q.s, l: act.q.l }].slice(0, 0) }); } };
  let pid = null, last = null;
  const pos = e => { const r = draw.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * W / r.height]; };
  draw.addEventListener('pointerdown', e => { if (finished) return; pid = e.pointerId; draw.setPointerCapture(pid); last = pos(e); hue = (hue + 37) % 360; d.fillStyle = `hsl(${hue} 85% 55%)`; d.beginPath(); d.arc(last[0], last[1], 15, 0, 7); d.fill(); });
  draw.addEventListener('pointermove', e => { if (e.pointerId !== pid || finished) return; const p = pos(e); d.strokeStyle = `hsl(${hue} 85% 55%)`; d.lineWidth = 30; d.lineCap = 'round'; d.beginPath(); d.moveTo(last[0], last[1]); d.lineTo(p[0], p[1]); d.stroke(); last = p; });
  const end = e => { if (e.pointerId !== pid) return; pid = null; upd(); };
  draw.addEventListener('pointerup', end); draw.addEventListener('pointercancel', end);
  const clear = btn('', 'small', () => { d.clearRect(0, 0, W, W); bar.firstChild.style.width = '0'; }, '🧹');
  const wrap = h('div', { class: 'trace' }, h('div', { class: 'tr-board' }, guide, draw), bar, clear);
  ctx.stage.append(wrap);
  return { solve: () => { d.fillStyle = '#ff5fa2'; for (const [x, y] of pts) { d.beginPath(); d.arc(x, y, 12, 0, 7); d.fill(); } upd(); } };
}
