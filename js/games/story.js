import { h, emo, btn, iconBtn } from '../ui.js';
import { say, sfx } from '../audio.js';
import * as choice from './choice.js';

export function render(act, ctx) {
  const box = h('div', { class: 'story' }); ctx.stage.append(box);
  let i = 0, qa = null; const dots = h('div', { class: 'dots' }, act.pages.map(() => h('i')));
  const page = () => {
    const p = act.pages[i]; box.replaceChildren(
      h('div', { class: 'sp-emojis' }, p.e.map(e => emo(e, 'huge'))),
      h('div', { class: 'sp-text' }, p.x), dots,
      h('div', { class: 'sp-nav' }, iconBtn('🔁', 'round', () => say(p)), btn(i < act.pages.length - 1 ? 'التالي' : 'سؤال عن القصة', 'big go', next, i < act.pages.length - 1 ? '▶️' : '❓')));
    [...dots.children].forEach((d, k) => d.className = k <= i ? 'on' : ''); say(p);
  };
  const next = () => {
    if (i < act.pages.length - 1) { i++; sfx('whoosh'); page(); return; }
    box.replaceChildren(); ctx.setQ(act.qa.q); qa = choice.render(act.qa, { ...ctx, stage: box });
  };
  page();
  return { solve: () => { if (!qa) { i = act.pages.length - 1; next(); } qa.solve(); } };
}
