// محرّك الجلسات: يختار الأنشطة، يعرضها، يتابع الأخطاء والنقاط والمكافآت.
import { h, $, emo, btn, iconBtn, show, overlay, confetti, fly, mascot, ar, sleep, shuffle } from './ui.js';
import { S, save, addCoins, recordLevel, weaken, addTime, lvStars } from './state.js';
import { say, stopSpeech, sfx } from './audio.js';
import * as choice from './games/choice.js';
import * as trace from './games/trace.js';
import * as tap from './games/tap.js';
import * as drag from './games/drag.js';
import * as story from './games/story.js';

const GAMES = { choice: choice.render, count: choice.render, trace: trace.render, balloons: tap.balloons, memory: tap.memory, order: tap.order, match: drag.match, sort: drag.sort, build: drag.build, story: story.render };
const EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const pick = a => a[(Math.random() * a.length) | 0];
const SESSION = 8;

export function pickSession(acts, n = SESSION) {
  const weak = acts.filter(a => a.sk && S.weak[a.sk] > 0);
  const chosen = shuffle(weak).slice(0, 3);
  const rest = shuffle(acts.filter(a => !chosen.includes(a))).sort((a, b) => (S.seen[a.id] || 0) - (S.seen[b.id] || 0) + (Math.random() - .5) * 1.5);
  const out = chosen.slice(); let traces = out.filter(a => a.t === 'trace').length;
  for (const a of rest) { if (out.length >= n) break; if (a.t === 'trace' && traces >= 2) continue; if (a.t === 'trace') traces++; out.push(a); }
  const s = shuffle(out);
  for (let i = 2; i < s.length; i++) if (s[i].t === s[i - 1].t && s[i].t === s[i - 2].t) { const j = s.findIndex((x, k) => k > i && x.t !== s[i].t); if (j > 0) [s[i], s[j]] = [s[j], s[i]]; }
  return s;
}

let timer = null;
function startClock() { clearInterval(timer); timer = setInterval(() => { if (!document.hidden && $('.act')) addTime(5); }, 5000); }
export function stopClock() { clearInterval(timer); }

export async function runLevel(D, world, level, opts = {}) {
  const ui = D.ui, acts = opts.acts || pickSession(level.acts);
  const mas = mascot(), dots = h('div', { class: 'pdots' }, acts.map(() => h('i')));
  const coinsPill = h('div', { class: 'pill' }, emo('🪙'), h('b', null, ar(S.coins)));
  let curQ = null;
  const qtext = h('div', { class: 'qtext' }), speak = iconBtn('🔊', 'speak', () => curQ && say(curQ));
  const stage = h('div', { class: 'stage' });
  let exited = false;
  const root = h('div', { class: 'act', style: { '--s1': world.sky[0], '--s2': world.sky[1], '--wc': world.color } },
    h('div', { class: 'act-top' }, iconBtn('🏠', 'round', () => { exited = true; stopSpeech(); stopClock(); opts.onExit && opts.onExit(); }, 'رجوع'), dots, coinsPill),
    h('div', { class: 'qbar' }, mas, speak, qtext), stage);
  show(root, 'act'); startClock();
  const total = { mistakes: 0, badActs: 0, first: 0, coins: 0 }; let combo = 0;
  const setQ = q => { curQ = q; qtext.textContent = q ? q.x : ''; qtext.dir = q && q.l === 'en' ? 'ltr' : 'rtl'; };
  const updCoins = () => { coinsPill.lastChild.textContent = ar(S.coins); };

  for (let i = 0; i < acts.length && !exited; i++) {
    await restCheck(D, () => { exited = true; opts.onExit && opts.onExit(); });
    if (exited) return;
    const act = acts[i]; S.seen[act.id] = (S.seen[act.id] || 0) + 1;
    [...dots.children].forEach((d, k) => d.className = k < i ? 'done' : k === i ? 'cur' : '');
    stage.replaceChildren(); stage.className = 'stage t-' + act.t;
    let mistakes = 0, finished = false, resolve; const fin = new Promise(r => resolve = r);
    const ctx = {
      stage, act, setQ, mistakes: () => mistakes,
      sayNum: (k, lang) => say(lang === 'en' && EN[k] ? { s: EN[k], l: 'en' } : ui['num' + k]),
      bad(o = {}) {
        if (finished) return mistakes;
        mistakes++; total.mistakes++; sfx('bad'); mas.react('sad'); weaken(act.sk, true); o.sk && weaken(o.sk, true);
        const list = [...(o.say || [])];
        if (mistakes === 2) list.push(act.hint || pick(world.hints)); else list.push(pick(ui.retry));
        say(list); return mistakes;
      },
      ok(o = {}) {
        if (finished) return; finished = true;
        const first = mistakes === 0; sfx('ok'); mas.react('happy');
        const r = stage.getBoundingClientRect(); confetti(14, r.left + r.width / 2, r.top + r.height / 3);
        if (first) { weaken(act.sk, false); combo++; total.first++; } else { combo = 0; total.badActs++; }
        const c = first ? 3 : 1; total.coins += c; addCoins(c); updCoins();
        const pr = Math.random() < .3 ? pick(S.gender === 'f' ? ui.praiseF : ui.praiseM) : pick(ui.praise);
        const list = [...(o.say || []), pr]; if (combo === 3) list.push(ui.combo3); if (combo === 5) list.push(ui.combo5);
        Promise.all([say(list), sleep(1000)]).then(() => sleep(250)).then(resolve);
      },
    };
    const q = act.t === 'story' ? null : act.q; if (act.t === 'story') { setQ({ x: act.title, s: '' }); } else { setQ(q); setTimeout(() => !exited && !finished && say(q), 350); }
    let ctl; try { ctl = GAMES[act.t](act, ctx); } catch (e) { console.error('خطأ في النشاط', act.id, e); resolve(); }
    window.__cur = { act, solve: () => ctl && ctl.solve && ctl.solve(), finished: () => finished, ctl };
    await fin;
  }
  if (exited) return;
  stopClock(); window.__cur = null;
  // النتيجة
  const bad = total.badActs, stars = bad <= 1 ? 3 : bad <= 3 ? 2 : 1;
  const bonus = 5 + stars * 5; addCoins(bonus);
  if (!opts.challenge) recordLevel(level.id, stars); else save();
  return result(D, world, level, { stars, bonus, total, challenge: opts.challenge });
}

async function result(D, world, level, r) {
  const ui = D.ui; let sticker = null;
  const all = []; D.stickers.albums.forEach(a => a.items.forEach((it, i) => { if (!S.stickers[a.id + ':' + i]) all.push([a, i, it]); }));
  if (all.length) { const [a, i, it] = pick(all); S.stickers[a.id + ':' + i] = 1; sticker = { a, it }; save(); }
  return new Promise(resolve => {
    const starsEl = h('div', { class: 'rs-stars' }, [1, 2, 3].map(n => h('span', { class: 'rs-star' }, emo('⭐'))));
    const stickerEl = sticker ? h('div', { class: 'rs-sticker' }, emo(sticker.it.e, 'huge'), h('b', null, sticker.it.x), h('small', null, 'ملصق جديد!')) : null;
    const idx = D.idx.worlds.indexOf(world); const lvIdx = world.levels.findIndex(l => l.id === level.id);
    const nxt = !r.challenge && world.levels[lvIdx + 1];
    const root = h('div', { class: 'act result', style: { '--s1': world.sky[0], '--s2': world.sky[1] } },
      h('div', { class: 'rs-card' }, mascot(), h('h2', null, r.stars === 3 ? 'ممتاز جدًّا!' : 'أحسنّا!'), starsEl,
        h('div', { class: 'rs-coins' }, emo('🪙'), h('b', null, '+' + ar(r.bonus + r.total.coins))), stickerEl,
        h('div', { class: 'rs-btns' }, nxt ? btn('المستوى التالي', 'big go', () => resolve('next'), '▶️') : null, btn('نلعب مرة أخرى', 'big', () => resolve('again'), '🔁'), btn('المدينة', 'big alt', () => resolve('home'), '🏠'))));
    root.querySelector('.mascot').classList.add('happy');
    show(root, 'result'); sfx('win'); confetti(60);
    (async () => {
      for (let i = 0; i < r.stars; i++) { await sleep(450); starsEl.children[i].classList.add('on'); sfx('star'); confetti(10, starsEl.children[i].getBoundingClientRect().left + 20, starsEl.getBoundingClientRect().top); }
      say([ui.levelDone, ui['star' + r.stars], ...(sticker ? [ui.newSticker, { s: sticker.it.s }] : [])]);
    })();
  });
}

async function restCheck(D, onExit) {
  const lim = S.settings.limit; if (!lim || S.time.sec < lim * 60 || S.restAsked === S.time.day + Math.floor(S.time.sec / (lim * 60))) return;
  S.restAsked = S.time.day + Math.floor(S.time.sec / (lim * 60)); save(); stopSpeech();
  return new Promise(res => {
    const o = overlay(h('div', { class: 'rest' }, mascot(), h('h2', null, 'حان وقت الراحة'), h('p', null, 'لعبنا كثيرًا اليوم. لنستريح قليلًا ثم نعود!'),
      h('div', { class: 'rs-btns' }, btn('أكمل (للأهل)', 'alt', async () => { const { gate } = await import('./parent.js'); if (await gate()) { o.close(); res(); } }), btn('أنهي اللعب', 'big go', () => { o.close(); onExit(); res(); }, '🏠'))));
    say(D.ui.rest);
  });
}
