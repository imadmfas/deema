// ألعاب السحب: توصيل، فرز، بناء كلمات (مع بديل النقر لصغار السن)
import { h, emo, shuffle, draggable } from '../ui.js';
import { optBody } from './common.js';
import { sfx, say } from '../audio.js';

export function match(act, ctx) {
  const L = h('div', { class: 'col' }), R = h('div', { class: 'col' });
  const wrap = h('div', { class: 'match' }, L, R); let sel = null, done = 0; const left = [], right = [];
  const tryPair = (le, re) => {
    if (le.dataset.p === re.dataset.p) {
      le.classList.add('ok'); re.classList.add('ok'); le.dataset.locked = 1; re.dataset.locked = 1; le.classList.remove('sel'); sel = null; sfx('pop');
      const o = act.pairs[+le.dataset.p]; say([o.b.s ? o.b : o.a]); done++; if (done === act.pairs.length) ctx.ok({});
    } else { re.classList.add('wrong'); setTimeout(() => re.classList.remove('wrong'), 500); if (sel) sel.classList.remove('sel'); sel = null; const m = ctx.bad({}); if (m >= 2) { const c = right.find(r => r.dataset.p === le.dataset.p); c && c.classList.add('glow'); } }
  };
  act.pairs.forEach((p, i) => { const e = h('div', { class: 'mi', 'data-p': i }, optBody(p.a)); left[i] = e; });
  shuffle(act.pairs.map((p, i) => i)).forEach(i => { const e = h('div', { class: 'mi tgt', 'data-p': i }, optBody(act.pairs[i].b)); right[i] = e; R.append(e); });
  left.forEach(e => {
    L.append(e);
    draggable(e, { targets: '.tgt', onTap: () => { if (e.dataset.locked) return; if (sel) sel.classList.remove('sel'); sel = e; e.classList.add('sel'); const o = act.pairs[+e.dataset.p].a; o.s && say(o); }, onDrop: t => { if (t) tryPair(e, t); } });
  });
  right.forEach(e => e.addEventListener('click', () => { if (sel && !e.dataset.locked) tryPair(sel, e); }));
  ctx.stage.append(wrap);
  return { solve: () => left.forEach((e, i) => tryPair(e, right[i])) };
}

export function sort(act, ctx) {
  const bins = h('div', { class: 'bins n' + act.bins.length }), pool = h('div', { class: 'pool' });
  let sel = null, left = act.items.length; const binEls = [];
  const place = (chip, bi) => {
    const it = act.items[+chip.dataset.i];
    if (it.bin === bi) { chip.classList.remove('sel'); chip.dataset.locked = 1; chip.classList.add('placed'); binEls[bi].querySelector('.bin-in').append(chip); sfx('pop'); it.s && say(it); sel = null; if (--left === 0) ctx.ok({}); }
    else { chip.classList.add('wrong'); setTimeout(() => chip.classList.remove('wrong'), 500); if (sel) sel.classList.remove('sel'); sel = null; const m = ctx.bad({ say: it.s ? [it] : [] }); if (m >= 2) binEls[it.bin].classList.add('glow'); }
  };
  act.bins.forEach((b, i) => { const e = h('div', { class: 'bin tgt', 'data-b': i, style: b.c && !b.x && !b.e ? { '--bc': b.c } : null }, h('div', { class: 'bin-l' }, optBody(b)), h('div', { class: 'bin-in' })); e.addEventListener('click', () => { if (sel) place(sel, i); }); binEls[i] = e; bins.append(e); });
  const chips = [];
  shuffle(act.items.map((o, i) => i)).forEach(i => {
    const o = act.items[i], c = h('div', { class: 'chip', 'data-i': i }, optBody(o)); chips[i] = c; pool.append(c);
    draggable(c, { targets: '.tgt', onTap: () => { if (c.dataset.locked) return; if (sel) sel.classList.remove('sel'); sel = c; c.classList.add('sel'); o.s && say(o); }, onDrop: t => { if (t) place(c, +t.dataset.b); } });
  });
  ctx.stage.append(h('div', { class: 'sort' }, pool, bins));
  return { solve: () => chips.forEach((c, i) => place(c, act.items[i].bin)) };
}

export function build(act, ctx) {
  const chars = [...act.word.x], rtl = act.dir === 'rtl';
  const slots = h('div', { class: 'slots', dir: rtl ? 'rtl' : 'ltr' }), tiles = h('div', { class: 'tiles', dir: rtl ? 'rtl' : 'ltr' });
  const se = []; let filled = 0;
  const fill = (tile, slot) => {
    const i = se.indexOf(slot), t = act.tiles[+tile.dataset.i];
    if (slot.classList.contains('full')) return false;
    if (t.x === chars[i]) {
      slot.classList.add('full'); slot.replaceChildren(h('span', { class: 'otx', dir: rtl ? 'rtl' : 'ltr' }, chars[i])); sfx('pop'); t.s && say(t); filled++;
      if (filled === chars.length) ctx.ok({ say: [act.word] }); return true;
    }
    tile.classList.add('wrong'); setTimeout(() => tile.classList.remove('wrong'), 500);
    const m = ctx.bad({ say: t.s ? [t] : [] }); if (m >= 2) { const nx = se.find(s => !s.classList.contains('full')); nx && nx.classList.add('glow'); } return false;
  };
  chars.forEach(() => se.push(h('div', { class: 'slot tgt' })));
  se.forEach(s => slots.append(s));
  const tl = [];
  shuffle(act.tiles.map((t, i) => i)).forEach(i => {
    const t = act.tiles[i], e = h('div', { class: 'tile', 'data-i': i }, h('span', { class: 'otx', dir: rtl ? 'rtl' : 'ltr' }, t.x)); tl[i] = e; tiles.append(e);
    draggable(e, { targets: '.slot', onTap: () => { t.s && say(t); const nx = se.find(s => !s.classList.contains('full')); nx && fill(e, nx); }, onDrop: tg => { if (tg) fill(e, tg); } });
  });
  const pic = h('div', { class: 'bpic' }, act.word.e ? emo(act.word.e, 'huge') : null);
  ctx.stage.append(h('div', { class: 'build' }, pic, slots, tiles));
  return { solve: () => chars.forEach((ch, i) => { const k = act.tiles.findIndex(t => t.x === ch); fill(tl[k], se[i]); }) };
}
