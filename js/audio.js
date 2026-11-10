// الصوت: مقاطع mp3 مولّدة مسبقًا (مفتاحها تجزئة النص) + تركيب أصوات المؤثرات والموسيقى بـ WebAudio.
import { S } from './state.js';

function h32(s, seed) { let h = seed >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
const hex = n => n.toString(16).padStart(8, '0');
export const sid = (l, s) => hex(h32(l + '|' + s, 2166136261)) + hex(h32(s + '|' + l, 0x9747b28c));

let gen = 0, cur = null, finishCur = null;
export function stopSpeech() {
  gen++;
  if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
  if (finishCur) { const f = finishCur; finishCur = null; f(); }
  try { speechSynthesis.cancel(); } catch (e) {}
}
function webSpeech(text, lang) {
  return new Promise(res => {
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'en' ? 'en-US' : 'ar-SA'; u.rate = .85;
      u.onend = u.onerror = () => res(); speechSynthesis.speak(u); setTimeout(res, 6000);
    } catch (e) { res(); }
  });
}
const FAST = new URLSearchParams(location.search).has('test');
function one(o, g) {
  if (FAST) return new Promise(r => setTimeout(r, 4));
  if (!o || !S.settings.voice || g !== gen) return Promise.resolve();
  const l = o.l || 'ar';
  const text = o.name ? o.name : o.s;
  if (!text) return Promise.resolve();
  if (o.name) return webSpeech(text, 'ar');
  return new Promise(res => {
    const a = new Audio(`audio/${l}/${sid(l, text)}.mp3`);
    cur = a; let done = false;
    const fin = ok => { if (done) return; done = true; if (finishCur === fin2) finishCur = null; if (cur === a) cur = null; if (!ok && g === gen) webSpeech(text, l).then(res); else res(); };
    const fin2 = () => fin(true); finishCur = fin2;
    a.onended = () => fin(true); a.onerror = () => fin(false);
    a.play().catch(() => fin(false));
  });
}
/** ينطق كائنًا {s,l} أو قائمة منها بالتتابع. يلغي أي نطق جارٍ ما لم تُمرَّر keep=true. */
export async function say(list, keep) {
  if (!keep) stopSpeech();
  const g = gen;
  const arr = (Array.isArray(list) ? list : [list]).filter(Boolean);
  for (const o of arr) { if (g !== gen) return; await one(o, g); }
}
export const sayKey = (ui, k) => say(ui[k]);

// ---------- WebAudio ----------
let ac = null, master = null, musicTimer = null, musicGain = null;
export function unlock() {
  if (!ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination); musicGain = ac.createGain(); musicGain.gain.value = .05; musicGain.connect(master); } catch (e) {}
  }
  if (ac && ac.state === 'suspended') ac.resume();
  if (S.settings.music) music(true);
}
function tone(f, t0, dur, type = 'sine', vol = .2, dest) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
  o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + .05);
}
const N = n => 440 * Math.pow(2, (n - 9) / 12); // 0 = دو الوسطى
export function sfx(k) {
  if (!S.settings.sfx || !ac) return; const t = ac.currentTime;
  const seq = {
    tap: [[72, 0, .06, 'triangle', .12]],
    ok: [[72, 0, .12, 'triangle', .22], [76, .09, .12, 'triangle', .22], [79, .18, .25, 'triangle', .22]],
    bad: [[60, 0, .16, 'sine', .22], [56, .13, .26, 'sine', .22]],
    pop: [[84, 0, .05, 'square', .1], [91, .03, .08, 'sine', .15]],
    coin: [[88, 0, .07, 'square', .08], [95, .07, .22, 'square', .08]],
    star: [[79, 0, .1, 'triangle', .2], [83, .1, .1, 'triangle', .2], [86, .2, .1, 'triangle', .2], [91, .3, .4, 'triangle', .2]],
    win: [[72, 0, .15, 'triangle', .22], [76, .15, .15, 'triangle', .22], [79, .3, .15, 'triangle', .22], [84, .45, .5, 'triangle', .25], [88, .6, .6, 'sine', .15]],
    whoosh: [[55, 0, .18, 'sawtooth', .04], [67, .05, .18, 'sawtooth', .03]],
    flip: [[76, 0, .05, 'triangle', .1]],
  }[k];
  if (seq) seq.forEach(([n, d, du, ty, v]) => tone(N(n - 69 + 9 + 0) , t + d, du, ty, v));
}
const PENT = [0, 2, 4, 7, 9, 12, 14, 16];
export function music(on) {
  clearInterval(musicTimer); musicTimer = null;
  if (!on || !ac) return;
  let step = 0;
  musicTimer = setInterval(() => {
    if (!S.settings.music || document.hidden) return;
    const t = ac.currentTime + .05;
    if (step % 4 === 0) tone(N(-12 + [0, 5, 7, 5][(step / 4) % 4 | 0]), t, 1.6, 'sine', .5, musicGain);
    if (Math.random() < .7) tone(N(PENT[(Math.random() * PENT.length) | 0]), t, .9, 'triangle', .35, musicGain);
    step++;
  }, 650);
}
