import { S, load, save, saveNow, palaceOpen, worldProgress, lvStars, today, addCoins } from './state.js';
import { say, unlock, stopSpeech, sfx, music } from './audio.js';
import { h, $, emo, btn, iconBtn, show, overlay, toast, confetti, ar, mascot, sleep } from './ui.js';
import { avatarSVG } from './avatar.js';
import { runLevel, pickSession, stopClock } from './engine.js';
import { lookEditor, wardrobe, album, studio } from './screens.js';
import { parentZone, gate } from './parent.js';

let D = null, hub3 = null; const wcache = {};
const getWorld = async id => wcache[id] || (wcache[id] = await fetch(`data/world-${id}.json`).then(r => r.json()));

async function boot() {
  load();
  const [idx, ui, stickers] = await Promise.all(['index', 'ui', 'stickers'].map(n => fetch(`data/${n}.json`).then(r => r.json())));
  D = { idx, ui, stickers, world: getWorld };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); saveNow(); } });
  addEventListener('pagehide', saveNow);
  splash();
  const p = new URLSearchParams(location.search);
  window.__deema = { D, get S() { return S; }, hub, levelSelect, playLevel, getWorld, wardrobe: () => wardrobe(D, { shop: true, back: hub }), album: () => album(D, hub), studio: () => studio(D, hub), parent: () => parentZone(D, hub), skip: () => { S.name = S.name || 'ديمة'; S.created = 1; save(); unlock(); hub(); } };
}

function splash() {
  const root = h('div', { class: 'splash' }, h('div', { class: 'sp-sun' }), mascot(), h('h1', null, 'مدينة ديمة', h('br'), 'التعليمية'), h('div', { class: 'sp-av', html: avatarSVG(S, { bust: true }) }),
    btn('هيا نلعب!', 'big go pulse', async () => { unlock(); if (!S.created) onboarding(); else { hub(); say([D.ui.welcomeBack, ...(S.name ? [{ name: S.name }] : [])]); } }, '▶️'));
  show(root, 'splash');
}

// ---------- التسجيل: الاسم، النوع، الشكل ----------
function onboarding() {
  const step = n => {
    if (n === 1) {
      const inp = h('input', { class: 'name-in', maxlength: 14, placeholder: 'اسمي', value: S.name || '', autocomplete: 'off' });
      const go = btn('التالي', 'big go', () => { if (!inp.value.trim()) { sfx('bad'); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; } S.name = inp.value.trim(); save(); step(2); }, '▶️');
      show(h('div', { class: 'screen onb' }, mascot(), h('h2', null, D.ui.askName.s), inp, go), 'onb'); say([D.ui.welcome, D.ui.askName]);
    } else if (n === 2) {
      const card = (g, label, key) => h('button', { class: 'gcard', onclick: () => { S.gender = g; S.look.style = 0; S.look.outfit = g === 'f' ? 0 : 1; save(); sfx('pop'); say(D.ui[key]); step(3); }, html: avatarSVG({ gender: g, look: S.look, equip: {} }, { bust: true }) + `<b>${label}</b>` });
      show(h('div', { class: 'screen onb' }, h('h2', null, D.ui.askGender.s), h('div', { class: 'gcards' }, card('f', 'بنت', 'girl'), card('m', 'ولد', 'boy'))), 'onb'); say(D.ui.askGender);
    } else {
      const prev = h('div', { class: 'ob-prev' }); const draw = () => prev.innerHTML = avatarSVG(S);
      draw();
      show(h('div', { class: 'screen onb' }, h('h2', null, D.ui.askLook.s), h('div', { class: 'ob-look' }, prev, lookEditor(draw)), btn('جاهزون!', 'big go', () => { S.created = 1; save(); sfx('win'); confetti(60); hub(); say([D.ui.welcome, { name: S.name }]); }, '✅')), 'onb'); say(D.ui.askLook);
    }
  };
  step(1);
}

// ---------- المدينة ----------
function buildingList() {
  const open = palaceOpen(D.idx);
  return [...D.idx.worlds.map(w => ({ id: w.id, kind: 'world', name: w.name, short: w.short, emoji: w.emoji, color: w.color, w })), { id: 'studio', kind: 'studio', name: 'مرسم ديمة', emoji: '🎨', color: '#ff8c42' }, { id: 'palace', kind: 'palace', name: 'قصر النجوم', emoji: '🏰', color: '#f4c430', locked: !open }];
}
function enter(b) {
  if (hub3) { hub3.dispose(); hub3 = null; }
  if (b.kind === 'world') levelSelect(b.w); else if (b.kind === 'studio') studio(D, hub);
  else if (!palaceOpen(D.idx)) { say(D.ui.levelLocked); const left = D.idx.worlds.filter(w => !w.levels.some(l => lvStars(l.id) > 0)); toast('ننهي مستوى واحدًا في كل عالم لنفتح القصر', '🏰'); hub(); }
  else wardrobe(D, { shop: true, back: hub });
}
async function hub() {
  stopSpeech(); stopClock(); if (hub3) { hub3.dispose(); hub3 = null; }
  const stars = h('b'), coins = h('b'), streak = h('b');
  const upd = () => { stars.textContent = ar(S.stars); coins.textContent = ar(S.coins); streak.textContent = ar(S.streak.n); };
  const snd = iconBtn(S.settings.music || S.settings.sfx ? '🔊' : '🔇', 'round', () => { const on = !(S.settings.music || S.settings.sfx); S.settings.music = S.settings.sfx = on ? 1 : 0; music(!!on); save(); snd.replaceChildren(emo(on ? '🔊' : '🔇')); }, 'الصوت');
  const gift = S.gift !== today() ? h('button', { class: 'gift', onclick: () => claimGift(gift, upd) }, emo('🎁', 'huge')) : null;
  const hud = h('div', { class: 'hud' }, h('button', { class: 'me', onclick: () => { if (hub3) { hub3.dispose(); hub3 = null; } wardrobe(D, { shop: false, back: hub }); }, html: avatarSVG(S, { bust: true }) }),
    h('div', { class: 'pill' }, emo('⭐'), stars), h('div', { class: 'pill' }, emo('🪙'), coins), h('div', { class: 'pill' }, emo('🔥'), streak), h('span', { class: 'sp' }),
    iconBtn('📒', 'round', () => { if (hub3) { hub3.dispose(); hub3 = null; } album(D, hub); }, 'الألبوم'), snd, iconBtn('🔒', 'round small', async () => { if (await gate()) { if (hub3) { hub3.dispose(); hub3 = null; } parentZone(D, hub); } }, 'للأهل'));
  const view = h('div', { class: 'hub-view' });
  const root = h('div', { class: 'hub' }, view, hud, gift); upd(); show(root, 'hub'); music(!!S.settings.music);
  if (S.settings.mode3d) { try { hub3 = await import('./hub3d.js').then(m => m.start(D, view, { onEnter: enter, onCoin: upd })); } catch (e) { console.warn('3D غير متاح', e); hub3 = null; } }
  if (!hub3) mapHub(view);
  if (palaceOpen(D.idx) && !S.seen.palace) { S.seen.palace = 1; save(); celebratePalace(); }
}
function mapHub(view) {
  view.classList.add('map');
  view.append(h('div', { class: 'map-grid' }, buildingList().map(b => h('button', { class: 'bcard' + (b.locked ? ' locked' : ''), style: { '--c': b.color }, onclick: () => { sfx('whoosh'); if (b.kind === 'world') say(D.ui['world-' + b.id]); enter(b); } }, emo(b.emoji, 'huge'), h('b', null, b.name), b.w ? (() => { const p = worldProgress(b.w); return h('small', null, emo('⭐'), `${ar(p.stars)}/${ar(p.max)}`); })() : null, b.locked ? emo('🔒', 'lk') : null))), h('div', { class: 'hub-hint' }, D.ui.hubHint.x));
}
function celebratePalace() {
  const o = overlay(h('div', { class: 'rest' }, emo('🏰', 'huge'), h('h2', null, 'فُتح قصر النجوم!'), h('p', null, 'أنهينا مستوى في كل عالم. فيه متجر الملابس والمفاجآت!'), btn('رائع!', 'big go', () => o.close())));
  sfx('win'); confetti(80); say(D.ui.palaceOpen);
}
async function claimGift(el, upd) {
  S.gift = today(); const bonus = Math.min(S.streak.n, 5), c = 8 + ((Math.random() * 8) | 0) + bonus * 2; addCoins(c);
  let st = null; if (Math.random() < .5) { const all = []; D.stickers.albums.forEach(a => a.items.forEach((it, i) => { if (!S.stickers[a.id + ':' + i]) all.push([a, i, it]); })); if (all.length) { const [a, i, it] = all[(Math.random() * all.length) | 0]; S.stickers[a.id + ':' + i] = 1; st = it; } }
  save(); el.remove(); upd(); sfx('win'); confetti(70);
  const o = overlay(h('div', { class: 'rest' }, emo('🎁', 'huge'), h('h2', null, 'مفاجأة اليوم!'), h('div', { class: 'rs-coins' }, emo('🪙'), h('b', null, '+' + ar(c))), st ? h('div', { class: 'rs-sticker' }, emo(st.e, 'huge'), h('b', null, st.x)) : null, btn('شكرًا!', 'big go', () => o.close())));
  say([D.ui.giftOpen, ...(st ? [D.ui.newSticker, { s: st.s }] : [])]);
}

// ---------- المستويات ----------
function levelSelect(w) {
  stopSpeech(); stopClock();
  const p = worldProgress(w);
  const grid = h('div', { class: 'lv-grid' });
  w.levels.forEach((lv, i) => {
    const locked = i > 0 && !lvStars(w.levels[i - 1].id) && !S.settings.unlockAll, s = lvStars(lv.id);
    const c = h('button', { class: 'lv' + (locked ? ' locked' : '') + (s ? ' done' : ''), onclick: () => { if (locked) { sfx('bad'); c.classList.add('shake'); setTimeout(() => c.classList.remove('shake'), 500); say(D.ui.levelLocked); return; } sfx('pop'); playLevel(w, lv); } },
      h('span', { class: 'n' }, ar(i + 1)), emo(lv.emoji, 'huge'), h('b', { dir: 'auto' }, lv.title), h('span', { class: 'st' }, [1, 2, 3].map(n => emo('⭐', n <= s ? '' : 'off'))), locked ? emo('🔒', 'lk') : null);
    grid.append(c);
  });
  const chal = p.done ? btn('تحدٍّ عشوائي', 'big alt', async () => { const wd = await getWorld(w.id); const pool = wd.levels.filter(l => lvStars(l.id) > 0).flatMap(l => l.acts); playLevel(w, { id: w.id + '*', title: 'تحدٍّ', acts: pool }, { challenge: true }); }, '🎲') : null;
  show(h('div', { class: 'screen levels', style: { '--s1': w.sky[0], '--s2': w.sky[1], '--wc': w.color } }, h('div', { class: 'bar' }, iconBtn('🏠', 'round', hub, 'رجوع'), h('h2', null, emo(w.emoji), w.name), h('div', { class: 'pill' }, emo('⭐'), `${ar(p.stars)}/${ar(p.max)}`)), grid, chal), 'levels');
  say(D.ui['world-' + w.id]);
}
async function playLevel(w, lv, opts = {}) {
  const wd = await getWorld(w.id); const level = opts.challenge ? lv : wd.levels.find(l => l.id === lv.id);
  const res = await runLevel(D, w, level, { challenge: opts.challenge, acts: opts.challenge ? pickSession(level.acts, 10) : undefined, onExit: () => levelSelect(w) });
  if (!res) return;
  if (res === 'next') { const i = w.levels.findIndex(l => l.id === lv.id); return playLevel(w, w.levels[i + 1]); }
  if (res === 'again') return playLevel(w, lv, opts);
  if (opts.challenge) return levelSelect(w);
  hub();
}
boot();
