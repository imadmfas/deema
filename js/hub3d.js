// المدينة ثلاثية الأبعاد (three.js): شخصية تمشي بالعصا أو بالنقر، مبانٍ للعوالم، نجوم تُجمع.
import * as THREE from 'three';
import { buildAvatar3D } from './avatar.js';
import { S, addCoins, palaceOpen } from './state.js';
import { say, sfx } from './audio.js';
import { h, emo, cpOf, ar } from './ui.js';

const lerp = (a, b, t) => a + (b - a) * t;
function signTex(b, locked) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 360; const g = c.getContext('2d');
  const rr = (x, y, w, hh, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, hh, r) : g.rect(x, y, w, hh); };
  g.fillStyle = 'rgba(255,255,255,.95)'; rr(10, 10, 280, 340, 40); g.fill(); g.lineWidth = 10; g.strokeStyle = locked ? '#9aa3b5' : b.color; g.stroke();
  g.fillStyle = locked ? '#9aa3b5' : b.color; g.font = '800 46px "Baloo Bhaijaan 2", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  g.fillText(b.name, 150, 300, 260);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const im = new Image(); im.onload = () => { g.globalAlpha = locked ? .45 : 1; g.drawImage(im, 55, 35, 190, 190); g.globalAlpha = 1; if (locked) { const l = new Image(); l.onload = () => { g.drawImage(l, 170, 150, 100, 100); tex.needsUpdate = true; }; l.src = 'assets/emoji/1f512.svg'; } tex.needsUpdate = true; };
  im.src = `assets/emoji/${cpOf(b.emoji)}.svg`;
  return tex;
}
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .75, flatShading: false, ...o });
function building(b, locked) {
  const g = new THREE.Group(), col = new THREE.Color(locked ? '#aab2c3' : b.color), dark = col.clone().multiplyScalar(.7);
  const add = (geo, m, x, y, z, rx = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.x = rx; me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  const W = 'white';
  switch (b.id) {
    case 'm': add(new THREE.BoxGeometry(5, 4, 5), mat(col), 0, 2, 0); add(new THREE.SphereGeometry(2.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(dark), 0, 4, 0); break;
    case 's': add(new THREE.CylinderGeometry(2.8, 3, 3.6, 20), mat(col), 0, 1.8, 0); add(new THREE.SphereGeometry(2.8, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#bfe9ff', { transparent: true, opacity: .8 }), 0, 3.6, 0); break;
    case 'i': add(new THREE.BoxGeometry(5, 3.6, 5), mat(col), 0, 1.8, 0); add(new THREE.SphereGeometry(1.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#f4c430'), 0, 3.6, 0); add(new THREE.CylinderGeometry(.35, .45, 6.4, 12), mat(W), 3.3, 3.2, -1.5); add(new THREE.ConeGeometry(.5, 1, 12), mat('#f4c430'), 3.3, 6.9, -1.5); break;
    case 'e': add(new THREE.BoxGeometry(5.4, 3.4, 4.4), mat(col), 0, 1.7, 0); add(new THREE.BoxGeometry(5.8, .5, 4.8), mat(dark), 0, 3.6, 0); add(new THREE.CylinderGeometry(.06, .06, 2.2, 6), mat(W), 2.4, 4.8, 0); add(new THREE.BoxGeometry(1.2, .8, .05), mat('#e63946'), 3, 5.5, 0); break;
    case 'a': add(new THREE.CylinderGeometry(2.4, 2.8, 3.8, 6), mat(col), 0, 1.9, 0); add(new THREE.ConeGeometry(3, 2.4, 6), mat('#ffd23f'), 0, 5, 0); for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.35, 8, 6), mat(['#ff5fa2', '#3fb8f0', '#5cc94a', '#9b5de5', '#ff8c42'][i]), Math.cos(i) * 2.6, .6, Math.sin(i) * 2.6 + 0); break;
    case 'r': add(new THREE.BoxGeometry(4.6, 5.2, 4.6), mat(col), 0, 2.6, 0); add(new THREE.ConeGeometry(3.6, 2.6, 4), mat(dark), 0, 6.5, 0, 0).rotation.y = Math.PI / 4; break;
    case 'g': add(new THREE.BoxGeometry(5, 3.4, 4.6), mat(col), 0, 1.7, 0); add(new THREE.ConeGeometry(4.2, 2.6, 4), mat(dark), 0, 4.7, 0).rotation.y = Math.PI / 4; break;
    case 'studio': add(new THREE.ConeGeometry(3.4, 5.2, 10), mat(col), 0, 2.6, 0); add(new THREE.CylinderGeometry(.08, .08, 1.6, 6), mat(W), 0, 5.9, 0); add(new THREE.OctahedronGeometry(.4), mat('#ffd23f'), 0, 6.9, 0); break;
    case 'palace': {
      const gold = locked ? '#b8bfcc' : '#f4c430'; add(new THREE.BoxGeometry(11, 5, 6), mat(locked ? '#cdd3df' : '#fff1c9'), 0, 2.5, 0); add(new THREE.BoxGeometry(4, 8, 4), mat(locked ? '#cdd3df' : '#ffe38a'), 0, 4, 0); add(new THREE.ConeGeometry(3, 3.6, 8), mat(gold), 0, 9.8, 0);
      [-6, 6].forEach(x => { add(new THREE.CylinderGeometry(1.2, 1.2, 8, 14), mat(locked ? '#cdd3df' : '#ffe38a'), x, 4, 0); add(new THREE.ConeGeometry(1.7, 2.6, 14), mat(gold), x, 9.3, 0); }); break;
    }
  }
  if (b.id !== 'studio') add(new THREE.BoxGeometry(1.2, 2, .2), mat('#7a4b2a'), 0, 1, b.id === 'palace' ? 3.05 : 2.4);
  return g;
}

export async function start(D, container, cb) {
  let renderer;
  try {
    const cv = document.createElement('canvas');
    if (!(cv.getContext('webgl2') || cv.getContext('webgl'))) return null;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
  } catch (e) { return null; }
  try { await document.fonts.load('800 40px "Baloo Bhaijaan 2"'); } catch (e) {}
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'hub-canvas'; container.append(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#aee4ff'); scene.fog = new THREE.Fog('#bfe9ff', 45, 120);
  const cam = new THREE.PerspectiveCamera(55, 1, .1, 220);
  scene.add(new THREE.HemisphereLight('#ffffff', '#8fd18a', 1.05));
  const sun = new THREE.DirectionalLight('#fff3d6', 1.6); sun.position.set(18, 30, 14); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -50, near: 1, far: 90 }); scene.add(sun); scene.add(sun.target);
  // الأرض والساحة والدروب
  const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 48), mat('#7fd16b')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(7, 40), mat('#f6e7bd')); plaza.rotation.x = -Math.PI / 2; plaza.position.y = .02; scene.add(plaza);
  // قائمة المباني
  const open = palaceOpen(D.idx);
  const list = D.idx.worlds.map(w => ({ id: w.id, name: w.short || w.name, color: w.color, emoji: w.emoji, kind: 'world', w }));
  list.push({ id: 'studio', name: 'مرسم ديمة', color: '#ff8c42', emoji: '🎨', kind: 'studio' });
  const R = 18, blds = [];
  list.forEach((b, i) => {
    const th = (20 + i * (140 / (list.length - 1))) * Math.PI / 180, x = Math.cos(th) * R, z = -Math.sin(th) * R * .95 - 2;
    blds.push({ ...b, x, z, rad: 3.6, door: new THREE.Vector3(x * .94, 0, z + 4.4) });
  });
  blds.push({ id: 'palace', name: 'قصر النجوم', color: '#f4c430', emoji: '🏰', kind: 'palace', x: 0, z: -35, rad: 6.5, door: new THREE.Vector3(0, 0, -29.5), locked: !open });
  const pick = [];
  blds.forEach(b => {
    const g = building(b, b.locked); g.position.set(b.x, 0, b.z); g.rotation.y = Math.atan2(-b.x * .25, 1) * .6; scene.add(g);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTex(b, b.locked), depthTest: false })); sp.scale.set(3.2, 3.8, 1); sp.position.set(b.x, (b.id === 'palace' ? 13.6 : 8.6), b.z); sp.renderOrder = 5; sp.userData.b = b; scene.add(sp); b.sign = sp; pick.push(sp, g);
    // درب من الساحة إلى الباب
    const dx = b.door.x, dz = b.door.z, len = Math.hypot(dx, dz), path = new THREE.Mesh(new THREE.PlaneGeometry(2.4, len), mat('#f6e7bd'));
    path.rotation.set(-Math.PI / 2, 0, Math.atan2(-dx, -dz)); path.position.set(dx / 2, .015, dz / 2); scene.add(path);
    g.userData.b = b; b.group = g;
  });
  // أشجار وزهور وغيوم
  const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2, r = 12 + rand() * 50, x = Math.cos(a) * r, z = Math.sin(a) * r - 6; if (blds.some(b => Math.hypot(b.x - x, b.z - z) < b.rad + 3) || Math.hypot(x, z - 6) < 6) continue;
    const t = new THREE.Group(), s = .8 + rand() * .8; const tr = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, 1.6, 8), mat('#8a5a33')); tr.position.y = .8; t.add(tr);
    const cr = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), mat(['#3fae49', '#56c256', '#2f9e5a'][i % 3])); cr.position.y = 2.5; cr.castShadow = true; t.add(cr); t.scale.setScalar(s); t.position.set(x, 0, z); scene.add(t);
  }
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(.18, 6, 5), mat('#fff'), 120); const cc = new THREE.Color();
  for (let i = 0; i < 120; i++) { const a = rand() * 6.28, r = 3 + rand() * 40; const m = new THREE.Matrix4().setPosition(Math.cos(a) * r, .2, Math.sin(a) * r - 6); fl.setMatrixAt(i, m); fl.setColorAt(i, cc.set(['#ff5fa2', '#ffd23f', '#ffffff', '#c77dff'][i % 4])); } scene.add(fl);
  const clouds = []; for (let i = 0; i < 7; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1.6 + rand(), 10, 8), mat('#fff', { transparent: true, opacity: .92 })); s.position.set(k * 1.8 - 3, rand() * .6, rand()); c.add(s); } c.position.set(-60 + rand() * 120, 22 + rand() * 8, -30 - rand() * 30); scene.add(c); clouds.push(c); }
  // نجوم قابلة للجمع
  const stars = []; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = 5 + (i % 3) * 3.2; const s = new THREE.Mesh(new THREE.OctahedronGeometry(.45), mat('#ffd23f', { emissive: '#ffb700', emissiveIntensity: .6 })); s.position.set(Math.cos(a) * r, 1.3, Math.sin(a) * r * .8 + 2); scene.add(s); stars.push(s); }
  // الشخصية
  const av = buildAvatar3D(THREE, S); av.position.set(0, 0, 8); scene.add(av);
  const st = { x: 0, z: 8, vx: 0, vz: 0, face: Math.PI, jump: 0, yv: 0, target: null }; const keys = {}; let joy = { x: 0, y: 0 };
  // الواجهة: عصا التحكم وزر القفز وبطاقة الدخول
  const stick = h('div', { class: 'stick' }, h('div', { class: 'knob' })); const jump = h('button', { class: 'jump', 'aria-label': 'قفز' }, emo('🦘'));
  const prompt = h('button', { class: 'enter-prompt hidden' }); const hint = h('div', { class: 'hub-hint' }, D.ui.hubHint.x);
  container.append(stick, jump, prompt, hint);
  const knob = stick.firstChild; let jp = null;
  stick.addEventListener('pointerdown', e => { jp = e.pointerId; stick.setPointerCapture(jp); mv(e); });
  const mv = e => { const r = stick.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = r.width / 2, d = Math.hypot(dx, dy); if (d > m) { dx *= m / d; dy *= m / d; } joy = { x: dx / m, y: dy / m }; knob.style.transform = `translate(${dx}px,${dy}px)`; st.target = null; };
  stick.addEventListener('pointermove', e => { if (e.pointerId === jp) mv(e); });
  const rel = e => { if (e.pointerId !== jp) return; jp = null; joy = { x: 0, y: 0 }; knob.style.transform = ''; };
  stick.addEventListener('pointerup', rel); stick.addEventListener('pointercancel', rel);
  const doJump = () => { if (!st.jump) { st.yv = 7.5; st.jump = 1; sfx('whoosh'); } };
  jump.addEventListener('pointerdown', doJump);
  const kd = e => { keys[e.key.toLowerCase()] = true; if (e.key === ' ') doJump(); }, ku = e => { keys[e.key.toLowerCase()] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  // نقر على الأرض أو المبنى
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return; down = null;
    const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(pick, true)[0];
    if (hit) { let o = hit.object; while (o && !o.userData.b) o = o.parent; if (o) { const b = o.userData.b; if (near === b) return enter(b); st.target = b.door.clone(); st.targetB = b; return; } }
    const gp = ray.intersectObject(ground)[0]; if (gp) { st.target = gp.point.clone(); st.targetB = null; sfx('tap'); }
  });
  let near = null, spoke = null;
  const enter = b => { sfx('whoosh'); cb.onEnter(b); };
  prompt.onclick = () => near && enter(near);
  const resize = () => { const w = container.clientWidth || innerWidth, hh = container.clientHeight || innerHeight; renderer.setSize(w, hh, false); cam.aspect = w / hh; cam.fov = w / hh < 1 ? 62 : 50; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);
  const clk = new THREE.Clock(); let raf, t = 0, got = 0, dead = false;
  const loop = () => {
    if (dead) return; raf = requestAnimationFrame(loop); if (document.hidden) { clk.getDelta(); return; }
    const dt = Math.min(clk.getDelta(), .05); t += dt;
    let ix = joy.x, iz = joy.y; if (keys.arrowleft || keys.a) ix -= 1; if (keys.arrowright || keys.d) ix += 1; if (keys.arrowup || keys.w) iz -= 1; if (keys.arrowdown || keys.s) iz += 1;
    if (st.target) { const dx = st.target.x - st.x, dz = st.target.z - st.z, d = Math.hypot(dx, dz); if (d < .4) { st.target = null; } else { ix = dx / d; iz = dz / d; } }
    const m = Math.min(1, Math.hypot(ix, iz)); const sp = 7.5 * m; if (m > .05) { const a = Math.atan2(ix, iz); st.face = a; st.x += Math.sin(a) * sp * dt; st.z += Math.cos(a) * sp * dt; }
    blds.forEach(b => { const dx = st.x - b.x, dz = st.z - b.z, d = Math.hypot(dx, dz), mr = b.rad + .6; if (d < mr) { st.x = b.x + dx / d * mr; st.z = b.z + dz / d * mr; } });
    st.x = Math.max(-34, Math.min(34, st.x)); st.z = Math.max(-44, Math.min(16, st.z));
    if (st.jump) { st.yv -= 20 * dt; st.jump += st.yv * dt; if (st.jump <= 0) { st.jump = 0; st.yv = 0; } }
    av.position.set(st.x, st.jump, st.z); let da = st.face - av.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); av.rotation.y += da * Math.min(1, dt * 12);
    const ud = av.userData, sw = Math.sin(t * 12) * (m > .05 ? .7 : 0); ud.legs[0].rotation.x = sw; ud.legs[1].rotation.x = -sw; ud.inner.position.y = m > .05 ? Math.abs(Math.sin(t * 12)) * .08 : Math.sin(t * 2) * .02; if (ud.wings) ud.wings.rotation.y = Math.sin(t * 6) * .15;
    const cx = lerp(cam.position.x, st.x * .9, Math.min(1, dt * 4)), cz = lerp(cam.position.z, st.z + 12.5, Math.min(1, dt * 4)); cam.position.set(cx, 13.5, cz + 4); cam.lookAt(cx + (st.x - cx) * .4, 2.5, st.z - 5);
    sun.position.set(st.x + 18, 30, st.z + 14); sun.target.position.set(st.x, 0, st.z);
    stars.forEach((s, i) => { if (!s.visible) return; s.rotation.y += dt * 2; s.position.y = 1.3 + Math.sin(t * 2 + i) * .25; if (Math.hypot(s.position.x - st.x, s.position.z - st.z) < 1.3 && st.jump < 1.6) { s.visible = false; got++; sfx('coin'); addCoins(1); cb.onCoin && cb.onCoin(); } });
    clouds.forEach(c => { c.position.x += dt * .8; if (c.position.x > 80) c.position.x = -80; });
    blds.forEach((b, i) => { b.sign.position.y += Math.sin(t * 2 + i) * .004; });
    let nb = null, nd = 1e9; blds.forEach(b => { const d = Math.hypot(st.x - b.door.x, st.z - b.door.z); if (d < 5 && d < nd) { nb = b; nd = d; } });
    if (nb !== near) { near = nb; if (nb) { prompt.replaceChildren(emo(nb.emoji), h('b', null, nb.name), nb.locked ? emo('🔒') : null); prompt.classList.remove('hidden'); if (spoke !== nb.id) { spoke = nb.id; const u = D.ui['world-' + nb.id]; if (nb.kind === 'world' && u) say(u); else if (nb.kind === 'palace') say(D.ui.palace); } } else { prompt.classList.add('hidden'); spoke = null; } }
    renderer.render(scene, cam);
  };
  loop();
  window.__hub = { st, blds, enter };
  return { dispose() { dead = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); scene.traverse(o => { o.geometry && o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map && m.map.dispose(); m.dispose(); }); } }); } };
}
