import { h, emo, ar } from '../ui.js';

const SHAPES = {
  circle: '<circle cx="50" cy="50" r="40"/>', square: '<rect x="12" y="12" width="76" height="76" rx="5"/>',
  rectangle: '<rect x="6" y="26" width="88" height="48" rx="5"/>', triangle: '<polygon points="50,9 93,87 7,87" stroke-linejoin="round"/>',
  heart: '<path d="M50 88 C8 58 4 28 27 18 C40 13 50 23 50 32 C50 23 60 13 73 18 C96 28 92 58 50 88Z"/>',
  star: '<polygon points="50,6 62,37 95,38 69,58 79,91 50,72 21,91 31,58 5,38 38,37" stroke-linejoin="round"/>',
};
export const shapeSVG = (sh, c = '#3fb8f0', cls = 'shape') => h('span', { class: cls, html: `<svg viewBox="0 0 100 100"><g fill="${c}" stroke="rgba(0,0,0,.18)" stroke-width="3">${SHAPES[sh] || SHAPES.circle}</g></svg>` });

/** محتوى خيار/عنصر: شكل، لون، أيقونة، نص. */
export function optBody(o) {
  const c = h('span', { class: 'ob' });
  if (o.sh) c.append(shapeSVG(o.sh, o.c));
  else if (o.c && !o.x && !o.e) c.append(h('span', { class: 'swatch', style: { background: o.c } }));
  else {
    if (o.e) c.append(emo(o.e, 'big'));
    if (o.x) c.append(h('span', { class: 'otx', dir: o.l === 'en' ? 'ltr' : 'rtl', lang: o.l || 'ar' }, o.x));
  }
  return c;
}

/** عرض مرئي للمسألة (مجموعات أيقونات، عمليات، نص كبير) */
export function visEl(pic) {
  const row = h('div', { class: 'vis', dir: 'ltr' });
  for (const p of pic) {
    if (p.op) row.append(h('span', { class: 'vop' }, p.op));
    else if (p.sh) row.append(shapeSVG(p.sh, p.c, 'shape vshape'));
    else if (p.e) {
      const g = h('span', { class: 'vgrp n' + Math.min(p.n || 1, 12) });
      for (let i = 0; i < (p.n || 1); i++) {
        const w = h('span', { class: 'vi' + (p.k && i >= p.n - p.k ? ' gone' : '') }, emo(p.e));
        g.append(w);
      }
      row.append(g);
    } else if (p.x) row.append(h('span', { class: 'vtx' + (p.big ? ' big' : ''), dir: 'rtl' }, p.x));
    else if (p.c) row.append(h('span', { class: 'swatch vs', style: { background: p.c } }));
  }
  return row;
}
export { ar };
