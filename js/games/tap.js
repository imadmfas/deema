// ألعاب النقر: بالونات، ذاكرة، ترتيب
import { h, emo, shuffle, rnd } from '../ui.js';
import { optBody } from './common.js';
import { sfx, say } from '../audio.js';

const BAL = ['#ff5fa2', '#3fb8f0', '#ffcc2e', '#5cc94a', '#9b5de5', '#ff8c42'];
export function balloons(act, ctx) {
  const sky = h('div', { class: 'sky-field' });
  const n = act.items.length, cols = n > 6 ? 4 : 3, rows = Math.ceil(n / cols);
  const pos = shuffle(act.items.map((_, i) => i));
  let popped = 0, locked = false; const els = [];
  act.items.forEach((o, i) => {
    const p = pos[i], cx = (p % cols + .5) / cols * 100, cy = (((p / cols) | 0) + .5) / rows * 100;
    const b = h('button', { class: 'balloon', style: { left: (cx + rnd(-4, 4)) + '%', top: (cy + rnd(-4, 4)) + '%', '--c': o.c || BAL[i % 6], animationDelay: rnd(0, 1.5) + 's' } }, o.sh || o.e || o.x ? optBody({ ...o, c: undefined }) : null, h('i', { class: 'str' }));
    b.onclick = () => {
      if (b.classList.contains('popped')) return;
      if (o.ok) { b.classList.add('popped'); sfx('pop'); popped++; if (o.s) say(o); if (popped >= act.need) ctx.ok({}); }
      else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 500); const m = ctx.bad({ say: o.s ? [o] : [] }); if (m >= 2) act.items.forEach((q, j) => { if (q.ok) els[j].classList.add('glow'); }); }
    };
    els.push(b); sky.append(b);
  });
  ctx.stage.append(sky);
  return { solve: () => els.forEach((b, i) => act.items[i].ok && b.click()) };
}

export function memory(act, ctx) {
  const cards = [];
  act.pairs.forEach((p, i) => { cards.push({ o: p.a, p: i }); cards.push({ o: p.b, p: i }); });
  const grid = h('div', { class: 'mem n' + cards.length }); let open = [], matched = 0, busy = false, miss = 0;
  const els = [];
  shuffle(cards).forEach(c => {
    const el = h('button', { class: 'card' }, h('span', { class: 'cf back' }, emo('⭐')), h('span', { class: 'cf front' }, optBody(c.o)));
    el.onclick = () => {
      if (busy || el.classList.contains('flip') || el.classList.contains('ok')) return;
      el.classList.add('flip'); sfx('flip'); if (c.o.s) say(c.o); open.push([el, c]);
      if (open.length === 2) {
        busy = true; const [[e1, c1], [e2, c2]] = open;
        if (c1.p === c2.p) { setTimeout(() => { e1.classList.add('ok'); e2.classList.add('ok'); sfx('pop'); matched++; open = []; busy = false; if (matched === act.pairs.length) ctx.ok({}); }, 700); }
        else { miss++; setTimeout(() => { e1.classList.remove('flip'); e2.classList.remove('flip'); open = []; busy = false; }, 1100); }
      }
    };
    els.push([el, c]); grid.append(el);
  });
  ctx.stage.append(grid);
  return { solve: () => { let i = 0; const go = () => { const pend = els.filter(([e]) => !e.classList.contains('ok')); if (!pend.length) return; const [e, c] = pend[0]; const mate = pend.find(([e2, c2]) => e2 !== e && c2.p === c.p); e.click(); setTimeout(() => { mate[0].click(); setTimeout(go, 900); }, 150); }; go(); } };
}

export function order(act, ctx) {
  const box = h('div', { class: 'ord n' + act.items.length }); let k = 0; const els = [];
  shuffle(act.items.map((o, i) => i)).forEach(i => {
    const o = act.items[i];
    const b = h('button', { class: 'ord-it' }, optBody(o));
    b.onclick = () => {
      if (b.classList.contains('done')) return;
      if (i === k) { b.classList.add('done'); b.append(h('b', { class: 'cn' }, String(k + 1).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]))); sfx('pop'); if (o.s) say(o); k++; if (k >= act.items.length) ctx.ok({}); }
      else { b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 500); const m = ctx.bad({}); if (m >= 2) els[k].classList.add('glow'); }
    };
    els[i] = b; box.append(b);
  });
  ctx.stage.append(box);
  return { solve: () => els.forEach(b => b.click()) };
}
