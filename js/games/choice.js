import { h, emo, shuffle } from '../ui.js';
import { optBody, visEl } from './common.js';
import { say } from '../audio.js';
import { sfx } from '../audio.js';

export function render(act, ctx) {
  const wrap = h('div', { class: 'choice sz-' + (act.size || 'md') });
  let top = null;
  if (act.t === 'count') top = counting(act, ctx); else if (act.pic) top = visEl(act.pic);
  if (top) wrap.append(top);
  const n = act.ch.length;
  const order = act.fixed ? act.ch.map((_, i) => i) : shuffle(act.ch.map((_, i) => i));
  const row = h('div', { class: 'opts n' + n });
  const els = [];
  let locked = false;
  const pick = i => {
    if (locked) return; const el = els[i], o = act.ch[i];
    if (el.classList.contains('dim')) return;
    if (i === act.a) {
      locked = true; el.classList.add('right'); sfx('pop');
      ctx.ok({ say: [o] });
    } else {
      el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 600);
      const m = ctx.bad({ say: [o], sk: o.sk });
      if (m >= 2) assist();
    }
  };
  const assist = () => { act.ch.forEach((_, i) => { if (i !== act.a) els[i].classList.add('dim'); else els[i].classList.add('glow'); }); };
  order.forEach(i => {
    const b = h('button', { class: 'opt', onclick: () => pick(i) }, optBody(act.ch[i]));
    els[i] = b; row.append(b);
  });
  wrap.append(row);
  ctx.stage.append(wrap);
  return { solve: () => pick(act.a) };
}

function counting(act, ctx) {
  const n = act.n, box = h('div', { class: 'cnt-field s' + (n > 12 ? 'xs' : n > 6 ? 'sm' : 'md') });
  const badge = h('div', { class: 'cnt-badge' }, '٠');
  let k = 0;
  for (let i = 0; i < n; i++) {
    const it = h('button', { class: 'cnt-it', style: { '--r': (Math.random() * 16 - 8) + 'deg' } }, emo(act.e));
    it.onclick = () => {
      if (it.classList.contains('on')) return; it.classList.add('on'); k++; sfx('pop');
      it.append(h('b', { class: 'cn' }, String(k).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])));
      badge.textContent = String(k).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
      ctx.sayNum(k, act.q && act.q.l);
    };
    box.append(it);
  }
  const wrap = h('div', { class: 'cnt' }, box, badge);
  wrap.solveCount = () => box.querySelectorAll('.cnt-it').forEach(b => b.click());
  return wrap;
}
