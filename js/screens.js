// شاشات: محرّر الشكل، الخزانة والمتجر، ألبوم الملصقات، المرسم
import { h, emo, btn, iconBtn, show, toast, confetti, ar, sleep } from './ui.js';
import { S, save, addCoins } from './state.js';
import { say, sfx } from './audio.js';
import { avatarSVG, SKIN, HAIR, OUTFIT, ITEMS, SLOTS } from './avatar.js';

const sw = (c, on, fn) => h('button', { class: 'sw' + (on ? ' on' : ''), style: { background: c }, onclick: fn });
export function lookEditor(onChange) {
  const box = h('div', { class: 'look' });
  const render = () => {
    const L = S.look;
    const row = (title, kids) => h('div', { class: 'lk-row' }, h('b', null, title), h('div', { class: 'lk-in' }, kids));
    box.replaceChildren(
      row('البشرة', SKIN.map((c, i) => sw(c, L.skin === i, () => { L.skin = i; upd(); }))),
      row('الشعر', HAIR.map((c, i) => sw(c, L.hair === i, () => { L.hair = i; upd(); }))),
      row('التسريحة', [0, 1, 2].map(i => h('button', { class: 'sty' + (L.style === i ? ' on' : ''), onclick: () => { L.style = i; upd(); }, html: avatarSVG({ gender: S.gender, look: { ...L, style: i }, equip: {} }, { bust: true }) }))),
      row('الثياب', OUTFIT.map((c, i) => sw(c, L.outfit === i, () => { L.outfit = i; upd(); }))));
  };
  const upd = () => { sfx('tap'); save(); render(); onChange && onChange(); };
  render(); return box;
}

export function wardrobe(D, { shop, back }) {
  let tab = 'items';
  const prev = h('div', { class: 'wd-prev' }), panel = h('div', { class: 'wd-panel' }), coins = h('div', { class: 'pill' }, emo('🪙'), h('b'));
  const draw = () => { prev.innerHTML = avatarSVG(S); coins.lastChild.textContent = ar(S.coins); };
  const items = () => {
    const g = h('div', { class: 'items' });
    ITEMS.forEach(it => {
      const owned = S.owned.includes(it.id), on = S.equip[it.slot] === it.id;
      const c = h('button', { class: 'item' + (on ? ' on' : '') + (!owned && !shop ? ' locked' : ''), onclick: () => {
        if (owned) { if (on) delete S.equip[it.slot]; else S.equip[it.slot] = it.id; sfx('tap'); save(); render(); return; }
        if (!shop) { toast('نجده في قصر النجوم', '🏰'); return; }
        if (S.coins < it.price) { sfx('bad'); say(D.ui.needCoins); toast('نحتاج إلى عملات أكثر', '🪙'); return; }
        addCoins(-it.price); S.owned.push(it.id); S.equip[it.slot] = it.id; save(); sfx('win'); confetti(40); say(D.ui.bought); render();
      } }, emo(it.emoji, 'big'), h('span', { class: 'nm' }, it.name), owned ? h('span', { class: 'tag' }, on ? 'مُرتدى' : 'لدينا') : (shop ? h('span', { class: 'price' }, emo('🪙'), ar(it.price)) : emo('🔒')));
      g.append(c);
    });
    return g;
  };
  const render = () => {
    draw();
    panel.replaceChildren(h('div', { class: 'tabs' }, [['items', 'الملابس'], ['look', 'الشكل']].map(([k, t]) => h('button', { class: 'tab' + (tab === k ? ' on' : ''), onclick: () => { tab = k; render(); } }, t))), tab === 'items' ? items() : lookEditor(draw));
  };
  const root = h('div', { class: 'screen wardrobe' + (shop ? ' palace' : '') },
    h('div', { class: 'bar' }, iconBtn('🏠', 'round', back, 'رجوع'), h('h2', null, emo(shop ? '🏰' : '👗'), shop ? 'قصر النجوم' : 'خزانتي'), coins),
    h('div', { class: 'wd-body' }, prev, panel));
  render(); show(root, 'wardrobe'); if (shop) say(D.ui.palace); return root;
}

export function album(D, back) {
  let cur = 0; const total = D.stickers.albums.reduce((a, x) => a + x.items.length, 0), have = () => Object.keys(S.stickers).length;
  const body = h('div', { class: 'al-body' }), tabs = h('div', { class: 'tabs scroll' }), head = h('h2');
  const render = () => {
    head.replaceChildren(emo('📒'), `ألبوم الملصقات ${ar(have())}/${ar(total)}`);
    tabs.replaceChildren(...D.stickers.albums.map((a, i) => h('button', { class: 'tab' + (i === cur ? ' on' : ''), onclick: () => { cur = i; render(); } }, emo(a.emoji), a.name)));
    const a = D.stickers.albums[cur];
    body.replaceChildren(...a.items.map((it, i) => { const own = S.stickers[a.id + ':' + i]; return h('button', { class: 'stk' + (own ? '' : ' empty'), onclick: () => { if (own) { sfx('pop'); say(it); } } }, own ? emo(it.e, 'huge') : h('span', { class: 'q' }, '؟'), own ? h('b', null, it.x) : null); }));
  };
  render(); show(h('div', { class: 'screen album' }, h('div', { class: 'bar' }, iconBtn('🏠', 'round', back, 'رجوع'), head), tabs, body), 'album');
}

// ---------- المرسم ----------
const P = (id, body) => ({ id, body });
const R = (t, a) => `<${t} class="rg" ${a}/>`;
const PAGES = [
  P('house', R('rect', 'x="195" y="78" width="24" height="50"') + R('rect', 'x="70" y="140" width="160" height="110"') + R('polygon', 'points="52,146 150,58 248,146"') + R('rect', 'x="130" y="188" width="40" height="62"') + R('rect', 'x="84" y="166" width="34" height="34"') + R('rect', 'x="182" y="166" width="34" height="34"') + R('circle', 'cx="255" cy="48" r="28"') + R('rect', 'x="0" y="250" width="300" height="50"')),
  P('fish', R('polygon', 'points="215,150 278,104 278,196"') + R('polygon', 'points="116,102 148,58 172,106"') + R('ellipse', 'cx="140" cy="150" rx="85" ry="55"') + R('circle', 'cx="100" cy="136" r="11"') + R('circle', 'cx="58" cy="72" r="14"') + R('circle', 'cx="36" cy="108" r="9"') + R('circle', 'cx="84" cy="40" r="9"')),
  P('butterfly', R('ellipse', 'cx="98" cy="112" rx="62" ry="54"') + R('ellipse', 'cx="202" cy="112" rx="62" ry="54"') + R('ellipse', 'cx="112" cy="196" rx="46" ry="40"') + R('ellipse', 'cx="188" cy="196" rx="46" ry="40"') + R('rect', 'x="141" y="96" width="18" height="130" rx="9"') + '<path class="ln" d="M146 98 Q120 50 98 40 M154 98 Q180 50 202 40"/>' + R('circle', 'cx="98" cy="40" r="7"') + R('circle', 'cx="202" cy="40" r="7"')),
  P('flower', R('rect', 'x="145" y="150" width="12" height="112"') + R('ellipse', 'cx="112" cy="214" rx="34" ry="15" transform="rotate(-25 112 214)"') + R('ellipse', 'cx="190" cy="196" rx="34" ry="15" transform="rotate(25 190 196)"') + [0, 1, 2, 3, 4, 5].map(i => R('circle', `cx="${150 + Math.cos(i * 1.047) * 46}" cy="${108 + Math.sin(i * 1.047) * 46}" r="31"`)).join('') + R('circle', 'cx="150" cy="108" r="28"') + R('rect', 'x="0" y="262" width="300" height="38"')),
  P('car', R('path', 'd="M84 152 L116 100 L206 100 L238 152Z"') + R('rect', 'x="38" y="150" width="224" height="62" rx="16"') + R('polygon', 'points="100,146 122,108 148,108 148,146"') + R('polygon', 'points="156,108 198,108 220,146 156,146"') + R('circle', 'cx="92" cy="214" r="30"') + R('circle', 'cx="208" cy="214" r="30"') + R('circle', 'cx="92" cy="214" r="12"') + R('circle', 'cx="208" cy="214" r="12"')),
  P('rocket', R('polygon', 'points="118,196 150,268 182,196"') + R('polygon', 'points="104,150 58,220 104,204"') + R('polygon', 'points="196,150 242,220 196,204"') + R('path', 'd="M150 24 Q204 86 204 196 L96 196 Q96 86 150 24Z"') + R('circle', 'cx="150" cy="112" r="26"') + R('circle', 'cx="48" cy="60" r="10"') + R('circle', 'cx="254" cy="94" r="8"') + R('circle', 'cx="244" cy="38" r="6"')),
  P('bear', R('circle', 'cx="84" cy="84" r="30"') + R('circle', 'cx="216" cy="84" r="30"') + R('ellipse', 'cx="150" cy="246" rx="62" ry="50"') + R('circle', 'cx="150" cy="130" r="72"') + R('ellipse', 'cx="150" cy="152" rx="34" ry="26"') + R('ellipse', 'cx="150" cy="140" rx="11" ry="8"') + R('circle', 'cx="122" cy="112" r="9"') + R('circle', 'cx="178" cy="112" r="9"')),
  P('tree', R('rect', 'x="134" y="170" width="32" height="98"') + R('circle', 'cx="150" cy="108" r="62"') + R('circle', 'cx="98" cy="150" r="44"') + R('circle', 'cx="202" cy="150" r="44"') + R('circle', 'cx="66" cy="58" r="32"') + R('circle', 'cx="132" cy="96" r="10"') + R('circle', 'cx="178" cy="136" r="10"') + R('circle', 'cx="108" cy="152" r="10"') + R('rect', 'x="0" y="266" width="300" height="34"')),
];
const PAL = ['#e63946', '#ff8c1a', '#ffd23f', '#2fb344', '#1d70d8', '#7fd3ff', '#8b5cf6', '#ff7eb6', '#8a5a33', '#ffffff'];
export function studio(D, back) {
  const menu = () => {
    const g = h('div', { class: 'pages' });
    PAGES.forEach(p => g.append(h('button', { class: 'pg', onclick: () => colorPage(p), html: `<svg viewBox="0 0 300 300">${thumb(p)}</svg>` + (S.art[p.id + '_done'] ? '<i class="chk">✓</i>' : '') })));
    g.append(h('button', { class: 'pg free', onclick: freeDraw }, emo('🖌️', 'huge'), h('b', null, 'رسم حر')));
    show(h('div', { class: 'screen studio' }, h('div', { class: 'bar' }, iconBtn('🏠', 'round', back, 'رجوع'), h('h2', null, emo('🎨'), 'مرسم ديمة')), g), 'studio'); say(D.ui.colorIntro);
  };
  const thumb = p => { const m = S.art[p.id] || {}; let i = 0; return p.body.replace(/class="rg"/g, () => { const f = m[i++]; return `class="rg" fill="${f || '#fff'}"`; }); };
  const colorPage = p => {
    let col = PAL[0]; const m = S.art[p.id] = S.art[p.id] || {};
    const svg = h('div', { class: 'canvas-svg', html: `<svg viewBox="0 0 300 300">${thumb(p)}</svg>` });
    const regs = [...svg.querySelectorAll('.rg')];
    const check = () => { if (!S.art[p.id + '_done'] && regs.every((_, i) => m[i])) { S.art[p.id + '_done'] = 1; addCoins(5); sfx('win'); confetti(60); say(D.ui.drawDone); toast('+٥', '🪙'); } save(); };
    regs.forEach((r, i) => r.addEventListener('click', () => { r.setAttribute('fill', col); m[i] = col; sfx('pop'); check(); }));
    const pal = h('div', { class: 'pal' }, PAL.map(c => h('button', { class: 'sw' + (c === col ? ' on' : ''), style: { background: c }, onclick: e => { col = c; pal.querySelectorAll('.sw').forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); sfx('tap'); } })));
    show(h('div', { class: 'screen studio' }, h('div', { class: 'bar' }, iconBtn('◀️', 'round', menu, 'رجوع'), h('h2', null, emo('🎨'), 'لنلوّن!'), btn('', 'small', () => { regs.forEach((r, i) => { r.setAttribute('fill', '#fff'); delete m[i]; }); save(); }, '🧹')), svg, pal), 'studio');
    window.__color = () => regs.forEach(r => r.dispatchEvent(new Event('click')));
  };
  const freeDraw = () => {
    const cv = h('canvas', { width: 800, height: 600, class: 'free-cv' }), c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 800, 600);
    let col = PAL[0], size = 14, pid = null, last;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 800 / r.width, (e.clientY - r.top) * 600 / r.height]; };
    cv.addEventListener('pointerdown', e => { pid = e.pointerId; cv.setPointerCapture(pid); last = pos(e); c.fillStyle = col; c.beginPath(); c.arc(last[0], last[1], size / 2, 0, 7); c.fill(); });
    cv.addEventListener('pointermove', e => { if (e.pointerId !== pid) return; const p = pos(e); c.strokeStyle = col; c.lineWidth = size; c.lineCap = 'round'; c.beginPath(); c.moveTo(...last); c.lineTo(...p); c.stroke(); last = p; });
    const up = e => { if (e.pointerId === pid) pid = null; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const pal = h('div', { class: 'pal' }, PAL.map(cc => h('button', { class: 'sw', style: { background: cc }, onclick: () => { col = cc; sfx('tap'); } })), [6, 14, 30].map(s => h('button', { class: 'sz', onclick: () => { size = s; sfx('tap'); } }, h('i', { style: { width: s + 'px', height: s + 'px' } }))));
    const save1 = btn('', 'small', () => { const a = h('a', { href: cv.toDataURL('image/png'), download: 'رسمتي.png' }); a.click(); }, '💾');
    show(h('div', { class: 'screen studio' }, h('div', { class: 'bar' }, iconBtn('◀️', 'round', menu, 'رجوع'), h('h2', null, emo('🖌️'), 'رسم حر'), save1, btn('', 'small', () => { c.fillStyle = '#fff'; c.fillRect(0, 0, 800, 600); }, '🧹')), h('div', { class: 'free-wrap' }, cv), pal), 'studio'); say(D.ui.drawIntro);
  };
  menu();
}
