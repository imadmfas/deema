// الشخصية: رسم ثنائي الأبعاد (SVG) للواجهة + مجسّم ثلاثي الأبعاد للمدينة، بالمعاملات نفسها.
export const SKIN = ['#ffdcb8', '#f1c27d', '#d39b68', '#9a6540'];
export const HAIR = ['#2a1b14', '#5b3a26', '#b9671f', '#e6b24c', '#e0508a'];
export const OUTFIT = ['#ff5fa2', '#3fb8f0', '#ffcc2e', '#5cc94a', '#9b5de5', '#ff8c42'];
export const ITEMS = [
  { id: 'cap', slot: 'head', name: 'قبعة رياضية', emoji: '🧢', price: 20 },
  { id: 'bow', slot: 'head', name: 'فيونكة', emoji: '🎀', price: 15 },
  { id: 'partyhat', slot: 'head', name: 'قبعة احتفال', emoji: '🎉', price: 15 },
  { id: 'starband', slot: 'head', name: 'طوق النجوم', emoji: '⭐', price: 25 },
  { id: 'crown', slot: 'head', name: 'تاج ذهبي', emoji: '👑', price: 40 },
  { id: 'glasses', slot: 'face', name: 'نظارة', emoji: '🕶️', price: 20 },
  { id: 'backpack', slot: 'back', name: 'حقيبة مدرسية', emoji: '🎒', price: 25 },
  { id: 'cape', slot: 'back', name: 'عباءة البطل', emoji: '🦸', price: 40 },
  { id: 'wings', slot: 'back', name: 'جناحان', emoji: '🦋', price: 55 },
  { id: 'goldfit', slot: 'outfit', name: 'ثوب ذهبي', emoji: '👗', price: 60 },
];
export const SLOTS = { head: 'الرأس', face: 'الوجه', back: 'الظهر', outfit: 'الثياب' };

// ---------- 2D ----------
export function avatarSVG(p, o = {}) {
  const g = p.gender || 'f', L = p.look || {}, eq = p.equip || {};
  const skin = SKIN[L.skin || 0], hair = HAIR[L.hair ?? 1], out = eq.outfit === 'goldfit' ? '#f4c430' : OUTFIT[L.outfit || 0], st = L.style || 0;
  const back = [], front = [];
  if (eq.back === 'wings') back.push('<ellipse cx="38" cy="150" rx="30" ry="48" fill="#fff" stroke="#cfe4ff" stroke-width="3" transform="rotate(-25 38 150)"/><ellipse cx="162" cy="150" rx="30" ry="48" fill="#fff" stroke="#cfe4ff" stroke-width="3" transform="rotate(25 162 150)"/>');
  if (eq.back === 'cape') back.push('<path d="M34 220 Q30 150 70 140 L130 140 Q170 150 166 220Z" fill="#e63946"/>');
  if (eq.back === 'backpack') back.push('<rect x="22" y="150" width="30" height="55" rx="12" fill="#2e86de"/><rect x="148" y="150" width="30" height="55" rx="12" fill="#2e86de"/>');
  if (g === 'f' && st === 0) back.push(`<path d="M48 95 Q44 175 62 190 L138 190 Q156 175 152 95Z" fill="${hair}"/>`);
  if (g === 'f' && st === 1) back.push(`<path d="M138 60 Q190 70 176 140 Q168 120 146 100Z" fill="${hair}"/>`);
  if (g === 'f' && st === 2) back.push(`<circle cx="46" cy="52" r="20" fill="${hair}"/><circle cx="154" cy="52" r="20" fill="${hair}"/>`);
  if (g === 'm' && st === 1) back.push(`<circle cx="62" cy="52" r="20" fill="${hair}"/><circle cx="138" cy="52" r="20" fill="${hair}"/><circle cx="100" cy="42" r="26" fill="${hair}"/>`);
  const body = `<path d="M40 222 Q40 150 100 148 Q160 150 160 222Z" fill="${out}"/><rect x="88" y="128" width="24" height="26" rx="8" fill="${skin}"/>` + (g === 'f' ? `<circle cx="100" cy="176" r="7" fill="#fff" opacity=".8"/>` : `<path d="M82 150 L100 172 L118 150Z" fill="#fff" opacity=".85"/>`);
  const head = `<circle cx="52" cy="100" r="10" fill="${skin}"/><circle cx="148" cy="100" r="10" fill="${skin}"/><circle cx="100" cy="95" r="50" fill="${skin}"/>`;
  let fh;
  if (g === 'f') fh = `<path d="M50 92 Q52 42 100 42 Q148 42 150 92 Q132 66 100 66 Q68 66 50 92Z" fill="${hair}"/>`;
  else if (st === 2) fh = `<path d="M50 90 L56 48 L72 66 L86 36 L100 62 L116 36 L128 66 L144 48 L150 90 Q130 62 100 62 Q70 62 50 90Z" fill="${hair}"/>`;
  else if (st === 1) fh = `<path d="M52 88 Q56 48 100 46 Q144 48 148 88 Q130 64 100 64 Q70 64 52 88Z" fill="${hair}"/>`;
  else fh = `<path d="M50 90 Q50 44 100 42 Q150 44 150 90 Q140 66 100 64 Q60 66 50 90Z" fill="${hair}"/>`;
  const face = `<ellipse cx="80" cy="98" rx="6.5" ry="8" fill="#2b2b3a"/><ellipse cx="120" cy="98" rx="6.5" ry="8" fill="#2b2b3a"/><circle cx="82.5" cy="95" r="2.6" fill="#fff"/><circle cx="122.5" cy="95" r="2.6" fill="#fff"/><circle cx="68" cy="116" r="8" fill="#ff8aa5" opacity=".45"/><circle cx="132" cy="116" r="8" fill="#ff8aa5" opacity=".45"/><path d="M86 120 Q100 136 114 120" stroke="#b5384d" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  if (eq.face === 'glasses') front.push('<g fill="rgba(40,40,60,.8)" stroke="#222" stroke-width="3"><rect x="62" y="86" width="32" height="24" rx="9"/><rect x="106" y="86" width="32" height="24" rx="9"/><path d="M94 96 H106" fill="none"/></g>');
  const H = eq.head;
  if (H === 'crown') front.push('<path d="M64 52 L70 22 L86 40 L100 14 L114 40 L130 22 L136 52Z" fill="#ffc933" stroke="#d99a00" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="30" r="5" fill="#e63946"/>');
  if (H === 'cap') front.push('<path d="M52 66 Q56 30 100 30 Q144 30 148 66Z" fill="#2e86de"/><path d="M48 68 Q100 78 168 66 L168 58 Q110 62 52 58Z" fill="#1f5fa8"/>');
  if (H === 'bow') front.push('<path d="M120 46 L148 30 L148 62Z M120 46 L92 30 L92 62Z" fill="#ff4f8b" transform="translate(14 -2)"/><circle cx="134" cy="46" r="7" fill="#d62d6b"/>');
  if (H === 'partyhat') front.push('<path d="M100 -4 L70 56 L130 56Z" fill="#9b5de5"/><circle cx="100" cy="-4" r="7" fill="#ffd23f"/><path d="M82 34 L118 34 M76 46 L124 46" stroke="#ffd23f" stroke-width="4"/>');
  if (H === 'starband') front.push('<path d="M52 62 Q100 36 148 62" stroke="#ffd23f" stroke-width="8" fill="none" stroke-linecap="round"/><text x="100" y="52" font-size="30" text-anchor="middle" fill="#ffc933">★</text>');
  const vb = o.bust ? '20 0 160 190' : '0 -16 200 240';
  return `<svg class="av" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${back.join('')}${body}${head}${face}${fh}${front.join('')}</svg>`;
}

// ---------- 3D ----------
export function buildAvatar3D(T, p) {
  const g = p.gender || 'f', L = p.look || {}, eq = p.equip || {}, st = L.style || 0;
  const skin = new T.Color(SKIN[L.skin || 0]), hair = new T.Color(HAIR[L.hair ?? 1]), outc = new T.Color(eq.outfit === 'goldfit' ? '#f4c430' : OUTFIT[L.outfit || 0]);
  const M = c => new T.MeshStandardMaterial({ color: c, roughness: .7 });
  const grp = new T.Group(), inner = new T.Group(); grp.add(inner);
  const mesh = (geo, c, x = 0, y = 0, z = 0, par = inner) => { const m = new T.Mesh(geo, M(c)); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; };
  // ساقان
  const legs = [-1, 1].map(s => { const pv = new T.Group(); pv.position.set(s * .17, .62, 0); inner.add(pv); mesh(new T.CylinderGeometry(.09, .09, .6, 10), skin, 0, -.3, 0, pv); mesh(new T.SphereGeometry(.13, 10, 8), new T.Color('#ffffff'), 0, -.6, .04, pv).scale.set(1, .7, 1.4); return pv; });
  // الجسم: ثوب مخروطي للبنت وقميص للولد
  if (g === 'f') mesh(new T.CylinderGeometry(.3, .5, .75, 16), outc, 0, .95, 0); else mesh(new T.CylinderGeometry(.34, .38, .62, 16), outc, 0, 1.0, 0);
  mesh(new T.SphereGeometry(.2, 10, 8), skin, -.4, 1.08, 0).scale.set(.6, 1.6, .6);
  mesh(new T.SphereGeometry(.2, 10, 8), skin, .4, 1.08, 0).scale.set(.6, 1.6, .6);
  const head = new T.Group(); head.position.y = 1.62; inner.add(head);
  mesh(new T.SphereGeometry(.42, 24, 18), skin, 0, 0, 0, head);
  mesh(new T.SphereGeometry(.07, 10, 8), '#2b2b3a', -.15, .04, .37, head); mesh(new T.SphereGeometry(.07, 10, 8), '#2b2b3a', .15, .04, .37, head);
  mesh(new T.SphereGeometry(.03, 8, 6), '#ffffff', -.13, .07, .43, head); mesh(new T.SphereGeometry(.03, 8, 6), '#ffffff', .17, .07, .43, head);
  const cheek = mesh(new T.SphereGeometry(.06, 8, 6), '#ff8aa5', -.26, -.1, .32, head); cheek.scale.z = .4; const ch2 = cheek.clone(); ch2.position.x = .26; head.add(ch2);
  const sm = new T.Mesh(new T.TorusGeometry(.1, .018, 6, 14, Math.PI), M('#b5384d')); sm.position.set(0, -.12, .39); sm.rotation.z = Math.PI; head.add(sm);
  // الشعر
  const hc = hair; const cap = mesh(new T.SphereGeometry(.45, 24, 14, 0, Math.PI * 2, 0, Math.PI * .55), hc, 0, .03, -.02, head);
  if (g === 'f' && st === 0) { mesh(new T.CylinderGeometry(.44, .36, .75, 16, 1, true), hc, 0, -.25, -.1, head).material.side = T.DoubleSide; }
  if (g === 'f' && st === 1) { const tl = mesh(new T.SphereGeometry(.14, 10, 8), hc, .0, .1, -.5, head); tl.scale.set(1, 1.5, 1); tl.position.set(.3, .02, -.38); }
  if (g === 'f' && st === 2) { mesh(new T.SphereGeometry(.17, 12, 10), hc, -.42, .3, 0, head); mesh(new T.SphereGeometry(.17, 12, 10), hc, .42, .3, 0, head); }
  if (g === 'm' && st === 1) { [[-.3, .3], [.3, .3], [0, .42], [-.38, .1], [.38, .1]].forEach(([x, y]) => mesh(new T.SphereGeometry(.17, 10, 8), hc, x, y, .0, head)); }
  if (g === 'm' && st === 2) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const c = mesh(new T.ConeGeometry(.1, .25, 6), hc, Math.cos(a) * .26, .44, Math.sin(a) * .26, head); c.rotation.z = -Math.cos(a) * .4; c.rotation.x = Math.sin(a) * .4; } }
  // الإكسسوارات
  const H = eq.head;
  if (H === 'crown') { mesh(new T.CylinderGeometry(.3, .25, .22, 5), '#ffc933', 0, .52, 0, head); }
  if (H === 'cap') { mesh(new T.SphereGeometry(.45, 20, 12, 0, Math.PI * 2, 0, Math.PI * .45), '#2e86de', 0, .08, 0, head); const b = mesh(new T.BoxGeometry(.5, .04, .3), '#1f5fa8', 0, .1, .45, head); b.rotation.x = .1; }
  if (H === 'bow') { mesh(new T.ConeGeometry(.13, .2, 3), '#ff4f8b', .26, .42, .1, head).rotation.z = Math.PI / 2; mesh(new T.ConeGeometry(.13, .2, 3), '#ff4f8b', .52, .42, .1, head).rotation.z = -Math.PI / 2; mesh(new T.SphereGeometry(.07, 8, 6), '#d62d6b', .39, .42, .1, head); }
  if (H === 'partyhat') mesh(new T.ConeGeometry(.28, .6, 12), '#9b5de5', 0, .72, 0, head);
  if (H === 'starband') { const t = mesh(new T.TorusGeometry(.43, .04, 6, 20, Math.PI), '#ffd23f', 0, .05, 0, head); t.rotation.z = 0; t.rotation.y = Math.PI / 2; mesh(new T.OctahedronGeometry(.1), '#ffc933', 0, .5, 0, head); }
  if (eq.face === 'glasses') { [-.16, .16].forEach(x => { const t = mesh(new T.TorusGeometry(.12, .02, 6, 16), '#222', x, .05, .4, head); }); mesh(new T.BoxGeometry(.1, .02, .02), '#222', 0, .05, .41, head); }
  if (eq.back === 'cape') { const c = mesh(new T.BoxGeometry(.7, .95, .04), '#e63946', 0, 1.05, -.38); c.rotation.x = .12; }
  if (eq.back === 'backpack') mesh(new T.BoxGeometry(.4, .5, .22), '#2e86de', 0, 1.05, -.38);
  let wings = null; if (eq.back === 'wings') { wings = new T.Group(); [-1, 1].forEach(s => { const w = mesh(new T.SphereGeometry(.4, 10, 8), '#ffffff', s * .5, 1.2, -.35, wings); w.scale.set(.35, 1, .12); w.rotation.z = -s * .3; }); inner.add(wings); }
  grp.userData = { legs, head, inner, wings };
  return grp;
}
