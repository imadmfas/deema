// حالة اللاعب المحفوظة محليًا (localStorage). لا تُرسَل أي بيانات إلى أي خادم.
const KEY = 'deema-v2';
const def = () => ({
  v: 2, name: '', gender: 'f', age: 6,
  look: { skin: 0, hair: 1, style: 0, outfit: 0 },
  coins: 0, stars: 0, done: {}, weak: {}, stickers: {}, owned: [], equip: {},
  streak: { last: '', n: 0 }, gift: '', art: {}, seen: {},
  settings: { music: 1, sfx: 1, voice: 1, limit: 20, mode3d: 1 },
  time: { day: '', sec: 0 },
});
export let S = def();
export const today = () => new Date().toISOString().slice(0, 10);

export function load() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) { S = { ...def(), ...JSON.parse(r) }; S.settings = { ...def().settings, ...S.settings }; S.look = { ...def().look, ...S.look }; }
    else {
      // اسم اللاعب من النسخة القديمة للعبة إن وُجد
      const old = localStorage.getItem('dima-learning-world-v1');
      if (old) { const o = JSON.parse(old); const n = o.name || o.playerName || (o.profile && o.profile.name); if (typeof n === 'string') S.name = n.slice(0, 20); }
    }
  } catch (e) { S = def(); }
  if (S.time.day !== today()) S.time = { day: today(), sec: 0 };
  return S;
}
let t;
export function save() { clearTimeout(t); t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150); }
export function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
export function reset() { S = def(); saveNow(); return S; }
export function importState(o) { S = { ...def(), ...o }; saveNow(); }

export const lvStars = id => (S.done[id] && S.done[id].s) || 0;
export const addCoins = n => { S.coins = Math.max(0, S.coins + n); save(); };
export function worldProgress(w) {
  const total = w.levels.length; const done = w.levels.filter(l => lvStars(l.id) > 0).length;
  const stars = w.levels.reduce((a, l) => a + lvStars(l.id), 0);
  return { total, done, stars, max: total * 3 };
}
export const palaceOpen = idx => idx.worlds.every(w => w.levels.some(l => lvStars(l.id) > 0));
export function recordLevel(id, stars) {
  const d = S.done[id] || { s: 0, n: 0 };
  d.n++; if (stars > d.s) { S.stars += stars - d.s; d.s = stars; } S.done[id] = d;
  // السلسلة اليومية
  const t0 = today();
  if (S.streak.last !== t0) {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1; S.streak.last = t0;
  }
  save();
}
export function weaken(sk, up) {
  if (!sk) return;
  const v = (S.weak[sk] || 0) + (up ? 1 : -1);
  if (v <= 0) delete S.weak[sk]; else S.weak[sk] = Math.min(v, 5);
  save();
}
export function addTime(sec) {
  if (S.time.day !== today()) S.time = { day: today(), sec: 0 };
  S.time.sec += sec; save();
}
