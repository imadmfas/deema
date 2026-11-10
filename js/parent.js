// بوابة الأهل (سؤال حسابي) ولوحة الأهل
import { h, emo, btn, iconBtn, show, overlay, toast, ar, shuffle } from './ui.js';
import { S, save, saveNow, reset, importState, worldProgress, lvStars } from './state.js';
import { sfx, music, say } from './audio.js';

export function gate() {
  return new Promise(res => {
    const a = 3 + ((Math.random() * 7) | 0), b = 4 + ((Math.random() * 6) | 0), ans = a * b;
    let opts = new Set([ans]); while (opts.size < 4) { const d = ans + [-10, -6, -4, -3, 3, 4, 6, 10, 12][(Math.random() * 9) | 0]; if (d > 0) opts.add(d); }
    const o = overlay(h('div', { class: 'gate' }, h('h2', null, 'للأهل فقط'), h('p', null, 'لنتأكد أنكم كبار: ما ناتج الضرب؟'), h('div', { class: 'gq' }, `${ar(a)} × ${ar(b)} = ؟`),
      h('div', { class: 'gopts' }, shuffle([...opts]).map(v => h('button', { class: 'btn', onclick: () => { if (v === ans) { o.close(); res(true); } else { sfx('bad'); o.querySelector('.gq').classList.add('shake'); setTimeout(() => o.querySelector('.gq').classList.remove('shake'), 500); } } }, ar(v)))),
      btn('إلغاء', 'alt', () => { o.close(); res(false); })));
  });
}

const labelFor = async (D, sk) => {
  for (const w of D.idx.worlds) {
    const wd = await D.world(w.id);
    for (const l of wd.levels) for (const a of l.acts) if (a.sk === sk) {
      if (a.t === 'trace') return a.g; if (a.t === 'build') return a.word.x;
      const o = a.ch && a.ch[a.a]; if (o) return (o.x || '') + ' ' + (o.e || '') ; if (a.q) return a.q.x;
    }
  }
  return sk;
};

export async function parentZone(D, back) {
  const mins = Math.round(S.time.sec / 60);
  const tog = (k, label) => h('label', { class: 'tg' }, h('input', { type: 'checkbox', checked: S[k.split('.')[0]][k.split('.')[1]] ? '' : null, onchange: e => { S.settings[k.split('.')[1]] = e.target.checked ? 1 : 0; save(); if (k === 'settings.music') music(!!S.settings.music); } }), label);
  const weak = Object.entries(S.weak).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const weakBox = h('div', { class: 'weak' }, weak.length ? 'جارٍ التحميل…' : 'لا توجد نقاط ضعف مسجّلة بعد. أحسنتِ يا ديمة!'.replace('أحسنتِ يا ديمة!', 'أداء طفلكم جيّد حتى الآن.'));
  if (weak.length) Promise.all(weak.map(async ([k, v]) => h('li', null, h('b', null, (await labelFor(D, k)).trim()), ` — أخطأ ${ar(v)} مرّة`))).then(li => weakBox.replaceChildren(h('ul', null, li)));
  const lim = h('select', { onchange: e => { S.settings.limit = +e.target.value; save(); } }, [0, 10, 15, 20, 30, 45].map(v => h('option', { value: v, selected: S.settings.limit === v ? '' : null }, v ? ar(v) + ' دقيقة' : 'بلا حدّ')));
  const worlds = D.idx.worlds.map(w => { const p = worldProgress(w); return h('div', { class: 'prow' }, h('span', null, emo(w.emoji), w.name), h('div', { class: 'meter' }, h('i', { style: { width: p.done / p.total * 100 + '%', background: w.color } })), h('small', null, `${ar(p.done)}/${ar(p.total)}`)); });
  const file = h('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, onchange: async e => { try { importState(JSON.parse(await e.target.files[0].text())); toast('تم الاستيراد', '✅'); setTimeout(() => location.reload(), 600); } catch (x) { toast('الملف غير صالح', '⚠️'); } } });
  const root = h('div', { class: 'screen parent' },
    h('div', { class: 'bar' }, iconBtn('🏠', 'round', back, 'رجوع'), h('h2', null, emo('👨‍👩‍👧'), 'لوحة الأهل')),
    h('div', { class: 'pz' },
      h('section', null, h('h3', null, 'ملخّص'), h('p', null, `${S.name || 'الطفل'} — النجوم ${ar(S.stars)}، العملات ${ar(S.coins)}، أيام متتالية ${ar(S.streak.n)}، وقت اللعب اليوم ${ar(mins)} دقيقة.`)),
      h('section', null, h('h3', null, 'التقدّم في العوالم'), worlds),
      h('section', null, h('h3', null, 'ما يحتاج إلى تكرار'), weakBox, h('small', null, 'تُكرَّر هذه العناصر تلقائيًّا في الجلسات القادمة حتى يتقنها الطفل.')),
      h('section', null, h('h3', null, 'الإعدادات'), tog('settings.voice', 'الصوت المنطوق'), tog('settings.sfx', 'مؤثرات الأصوات'), tog('settings.music', 'الموسيقى'), tog('settings.mode3d', 'المدينة ثلاثية الأبعاد (أوقفوها إن كان الجهاز بطيئًا)'), tog('settings.unlockAll', 'فتح كل المستويات'), h('label', { class: 'tg' }, 'حدّ اللعب اليومي: ', lim)),
      h('section', null, h('h3', null, 'البيانات'), h('p', null, 'تُحفظ كل البيانات على هذا الجهاز فقط ولا تُرسَل إلى أي جهة.'),
        h('div', { class: 'rs-btns' }, btn('تصدير التقدّم', 'small', () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(S)], { type: 'application/json' })), download: 'deema-progress.json' }); a.click(); }, '💾'), btn('استيراد', 'small', () => file.click(), '📥'),
          btn('تصفير كل شيء', 'small danger', () => { if (confirm('سيُحذف كل التقدّم. هل أنتم متأكدون؟')) { reset(); location.reload(); } }, '🗑️')), file),
      h('section', null, h('h3', null, 'عن اللعبة'), h('p', null, 'مدينة ديمة التعليمية — لعبة مجانية مفتوحة المصدر. الأيقونات من مشروع Twemoji (CC-BY 4.0)، والخط Baloo Bhaijaan 2 (OFL)، والمجسّمات بمكتبة three.js (MIT). الأصوات مولّدة آليًّا (Edge TTS).'))));
  show(root, 'parent');
}
