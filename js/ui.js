// أدوات الواجهة المشتركة
import { sfx } from './audio.js';

export const $ = (s, r = document) => r.querySelector(s);
export function h(tag, a, ...kids) {
  const e = document.createElement(tag);
  if (a) for (const k in a) {
    const v = a[k]; if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
export const cpOf = e => [...e].filter(c => c.codePointAt(0) !== 0xfe0f).map(c => c.codePointAt(0).toString(16)).join('-');
export const emo = (e, cls = '') => h('img', { class: 'em ' + cls, src: `assets/emoji/${cpOf(e)}.svg`, alt: e, draggable: 'false' });
export const rnd = (a, b) => a + Math.random() * (b - a);
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
export const FAST = new URLSearchParams(location.search).has('test');
export const sleep = ms => new Promise(r => setTimeout(r, FAST ? ms / 25 : ms));
export const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

export function btn(label, cls, onclick, icon) {
  return h('button', { class: 'btn ' + (cls || ''), onclick: e => { sfx('tap'); onclick && onclick(e); } }, icon ? emo(icon) : null, label ? h('span', null, label) : null);
}
export function iconBtn(icon, cls, onclick, label) {
  return h('button', { class: 'ibtn ' + (cls || ''), 'aria-label': label || '', onclick: e => { sfx('tap'); onclick(e); } }, emo(icon));
}

// ---------- الشاشات ----------
const app = () => $('#app');
export function show(el, name) {
  const a = app(); a.replaceChildren(el); a.dataset.screen = name || ''; window.scrollTo(0, 0);
}
export function overlay(content, cls = '') {
  const o = h('div', { class: 'overlay ' + cls }, content);
  document.body.append(o); requestAnimationFrame(() => o.classList.add('in'));
  o.close = () => { o.classList.remove('in'); setTimeout(() => o.remove(), 250); };
  return o;
}
export function toast(msg, icon) {
  const t = h('div', { class: 'toast' }, icon ? emo(icon) : null, msg);
  document.body.append(t); requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2200);
}

// ---------- قصاصات ورقية ----------
const COLORS = ['#ff5fa2', '#ffd23f', '#3fb8f0', '#5cc94a', '#9b5de5', '#ff8c42'];
export function confetti(n = 36, x, y) {
  const w = innerWidth, hh = innerHeight; x = x ?? w / 2; y = y ?? hh / 3;
  const box = h('div', { class: 'confetti' }); document.body.append(box);
  for (let i = 0; i < n; i++) {
    const p = h('i', { style: { left: x + 'px', top: y + 'px', background: COLORS[i % 6], '--dx': rnd(-260, 260) + 'px', '--dy': rnd(80, 420) + 'px', '--r': rnd(-540, 540) + 'deg', animationDelay: rnd(0, .15) + 's', borderRadius: i % 3 ? '2px' : '50%' } });
    box.append(p);
  }
  setTimeout(() => box.remove(), 1900);
}
export function fly(icon, from, to, n = 5, done) {
  // عملات/نجوم تطير من نقطة إلى أخرى
  for (let i = 0; i < n; i++) {
    const e = emo(icon, 'fly'); e.style.left = from.x + 'px'; e.style.top = from.y + 'px'; document.body.append(e);
    setTimeout(() => { e.style.transform = `translate(${to.x - from.x}px,${to.y - from.y}px) scale(.5)`; e.style.opacity = .2; }, 30 + i * 90);
    setTimeout(() => { e.remove(); if (i === n - 1 && done) done(); }, 800 + i * 90);
  }
}

// ---------- النجم «نجمو» ----------
export function mascotSVG() {
  return `<svg viewBox="0 0 120 120" class="mascot-svg"><path class="mbody" d="M60 6 L75 40 L112 44 L84 69 L93 106 L60 87 L27 106 L36 69 L8 44 L45 40Z" fill="#ffd23f" stroke="#f2a900" stroke-width="5" stroke-linejoin="round"/>
  <g class="meyes"><ellipse cx="48" cy="58" rx="5" ry="6.5" fill="#2b2b3a"/><ellipse cx="72" cy="58" rx="5" ry="6.5" fill="#2b2b3a"/><circle cx="50" cy="55.5" r="2" fill="#fff"/><circle cx="74" cy="55.5" r="2" fill="#fff"/></g>
  <circle cx="38" cy="70" r="6" fill="#ff8aa5" opacity=".6"/><circle cx="82" cy="70" r="6" fill="#ff8aa5" opacity=".6"/>
  <path class="msmile" d="M50 72 Q60 84 70 72" stroke="#b5384d" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>`;
}
export function mascot() {
  const m = h('div', { class: 'mascot', html: mascotSVG() });
  m.react = k => { m.classList.remove('happy', 'sad', 'think'); void m.offsetWidth; m.classList.add(k); setTimeout(() => m.classList.remove(k), 1200); };
  return m;
}

// ---------- سحب وإفلات (مع بديل النقر) ----------
export function draggable(el, { onTap, onDrop, targets, onStart }) {
  let sx, sy, ghost, moved, pid;
  el.addEventListener('pointerdown', e => {
    if (el.dataset.locked) return; pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false; el.setPointerCapture(pid);
    const mv = ev => {
      if (ev.pointerId !== pid) return;
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 9) {
        moved = true; const r = el.getBoundingClientRect(); ghost = el.cloneNode(true); ghost.classList.add('ghost');
        ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px'; document.body.append(ghost); el.classList.add('lifted'); onStart && onStart();
      }
      if (moved) { ghost.style.transform = `translate(${ev.clientX - sx}px,${ev.clientY - sy}px) scale(1.08)`; }
    };
    const up = ev => {
      if (ev.pointerId !== pid) return;
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      if (moved) {
        ghost.style.display = 'none'; const t = document.elementFromPoint(ev.clientX, ev.clientY); ghost.remove(); el.classList.remove('lifted');
        const tg = t && t.closest(targets); onDrop && onDrop(tg, ev);
      } else onTap && onTap(ev);
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}
