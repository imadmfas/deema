# -*- coding: utf-8 -*-
"""يجمع كل عوالم اللعبة في ملفات JSON ويستخرج قائمة النصوص المنطوقة وأيقونات Twemoji المستعملة.

التشغيل:  python3 tools/build_content.py
المخرجات:
  data/index.json          فهرس العوالم والمستويات (خفيف)
  data/world-<id>.json     أنشطة كل عالم (يُحمَّل عند دخوله)
  data/ui.json             العبارات المنطوقة العامة
  data/stickers.json       ألبوم الملصقات
  tools/speech_list.json   كل ما يحتاج توليدًا صوتيًا
  assets/emoji/*.svg       الأيقونات المستعملة فقط
"""
import hashlib
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, "content"))
import common  # noqa: E402
from common import E, NUM_WORDS, Q  # noqa: E402
import reading, maths, science, moral, islamic, english, art  # noqa: E402

MODS = [reading, maths, science, moral, islamic, english, art]

# ---------- ألبوم الملصقات ----------
ALBUMS = [
    ("farm", "المزرعة", "🐄", [("🐄", "بقرة"), ("🐑", "خروف"), ("🐔", "دجاجة"), ("🐴", "حصان"), ("🐐", "ماعز"), ("🦆", "بطة"), ("🐇", "أرنب"), ("🐕", "كلب"), ("🐈", "قطة"), ("🐓", "ديك")]),
    ("sea", "البحر", "🐬", [("🐟", "سمكة"), ("🐠", "سمكة ملونة"), ("🐡", "سمكة منتفخة"), ("🐬", "دلفين"), ("🐳", "حوت"), ("🦈", "قرش"), ("🐙", "أخطبوط"), ("🦀", "سلطعون"), ("🐢", "سلحفاة"), ("🦐", "روبيان")]),
    ("jungle", "الغابة", "🦁", [("🦁", "أسد"), ("🐯", "نمر"), ("🐘", "فيل"), ("🦒", "زرافة"), ("🐒", "قرد"), ("🦓", "حمار وحشي"), ("🦊", "ثعلب"), ("🐻", "دب"), ("🐼", "باندا"), ("🦉", "بومة")]),
    ("sky", "الطيور والحشرات", "🦋", [("🦋", "فراشة"), ("🐝", "نحلة"), ("🐞", "دعسوقة"), ("🐜", "نملة"), ("🐦", "عصفور"), ("🦅", "نسر"), ("🦜", "ببغاء"), ("🦚", "طاووس"), ("🕊️", "حمامة"), ("🦢", "بجعة")]),
    ("fruit", "الفواكه والخضار", "🍎", [("🍎", "تفاحة"), ("🍌", "موزة"), ("🍇", "عنب"), ("🍓", "فراولة"), ("🍉", "بطيخ"), ("🍊", "برتقالة"), ("🥕", "جزرة"), ("🌽", "ذرة"), ("🍒", "كرز"), ("🥦", "بروكلي")]),
    ("space", "الفضاء والمركبات", "🚀", [("🚀", "صاروخ"), ("🌙", "قمر"), ("⭐", "نجمة"), ("🪐", "كوكب"), ("🚗", "سيارة"), ("🚌", "حافلة"), ("✈️", "طائرة"), ("🚢", "سفينة"), ("🚲", "دراجة"), ("🚁", "مروحية")]),
]

# ---------- العبارات المنطوقة العامة ----------
PRAISE = ["أحسنت!", "ممتاز!", "رائع!", "يا سلام!", "إجابة صحيحة!", "برافو!", "عمل جميل!", "مذهل!", "نجمة جديدة لنا!", "هذا صحيح!"]
PRAISE_F = ["يا بطلة!", "أنتِ ذكية جدًّا!", "أنتِ مبدعة!"]
PRAISE_M = ["يا بطل!", "أنت ذكي جدًّا!", "أنت مبدع!"]
RETRY = ["لنحاول مرة أخرى!", "لا بأس، لنجرّب من جديد!", "اقتربنا من الإجابة!", "لنفكّر معًا!", "خطأ صغير، يمكننا تصحيحه!", "هيا مرة أخرى!"]
ORD = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"]
UI = {
    "welcome": "أهلًا وسهلًا في مدينة ديمة التعليمية!",
    "welcomeBack": "أهلًا بعودتك!",
    "askName": "ما اسمك؟",
    "askGender": "هل أنت بنت أم ولد؟",
    "askLook": "لنختر شكل شخصيتنا!",
    "askAge": "كم عمرك؟",
    "girl": "بنت", "boy": "ولد",
    "hubHint": "لنضغط على أحد المباني لندخله!",
    "levelPick": "أي مستوى نختار؟",
    "levelDone": "ما شاء الله! أنهينا المستوى بنجاح!",
    "star1": "حصلنا على نجمة!", "star2": "حصلنا على نجمتين!", "star3": "حصلنا على ثلاث نجوم! رائع!",
    "combo3": "ثلاث إجابات صحيحة متتالية! مذهل!", "combo5": "خمس إجابات صحيحة متتالية! مدهش!",
    "giftReady": "هدية اليوم بانتظارنا!", "giftOpen": "فتحنا الهدية! حصلنا على مفاجأة!",
    "newSticker": "ملصق جديد في ألبومنا!", "album": "ألبوم الملصقات", "shop": "متجر قصر النجوم",
    "rest": "حان وقت الراحة! لنأخذ استراحة ونلعب لاحقًا.",
    "palace": "قصر النجوم",
    "palaceOpen": "فتح قصر النجوم! لنزره الآن!",
    "bought": "اشتريناها! ما أجملها!", "needCoins": "نحتاج إلى عملات أكثر، لنلعب ونجمعها!",
    "dragHelp": "لنسحب كل صورة إلى مكانها", "matchHelp": "لنسحب كل شيء إلى ما يناسبه",
    "memoryHelp": "لنقلب البطاقات ونبحث عن الأزواج", "buildHelp": "لنسحب الحروف إلى أماكنها",
    "orderHelp": "لنضغط على الأشياء بالترتيب", "countHelp": "لنعدّ بالضغط على كل شيء",
    "storyHelp": "لنستمع إلى القصة", "storyQ": "والآن، سؤال عن القصة",
    "drawIntro": "لنرسم ما نحب!", "colorIntro": "لنلوّن الصورة!", "drawDone": "ما أجمل لوحتنا!",
    "memoryWin": "وجدنا كل الأزواج!", "goodbye": "إلى اللقاء! نراكم قريبًا.",
    "tapNext": "لنضغط للمتابعة", "great": "عمل رائع!", "yes": "نعم", "no": "لا",
    "hintGeneric": "لنفكّر قليلًا ونحاول من جديد",
    "challenge": "تحدٍّ عشوائي من كل المستويات",
    "levelLocked": "لنُنهِ المستوى السابق أولًا!",
}
for i, n in enumerate(ORD):
    UI[f"lvl{i + 1}"] = f"المستوى {n}"
for i in range(1, 21):
    UI[f"num{i}"] = NUM_WORDS[i]


def h32(s, seed):
    """FNV-1a على وحدات UTF-16 — يطابق دالة JS في js/audio.js تمامًا."""
    h = seed
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def sid(lang, s):
    return f"{h32(lang + '|' + s, 2166136261):08x}{h32(s + '|' + lang, 0x9747b28c):08x}"


def norm(s):
    return re.sub(r"\s+", " ", s.replace("ﷺ", " صلى الله عليه وسلم").replace("＿", " ")).strip()


def walk(o, acc):
    if isinstance(o, dict):
        s = o.get("s")
        if isinstance(s, str) and s.strip():
            o["s"] = norm(s)
            acc.add((o.get("l", "ar"), o["s"]))
        for v in o.values():
            walk(v, acc)
    elif isinstance(o, list):
        for v in o:
            walk(v, acc)


def main():
    out = os.path.join(ROOT, "data")
    os.makedirs(out, exist_ok=True)
    speech = set()
    index = {"version": 3, "worlds": []}
    total_acts = 0
    kinds = {}
    for m in MODS:
        levels = m.build_levels()
        meta = {k: v for k, v in m.META.items() if k not in ("hints",)}
        meta["emoji"] = E(meta["emoji"])
        meta["hints"] = [Q(h) for h in m.HINTS]
        meta["welcome"] = f"أهلًا بنا في {meta['name']}!"
        UI[f"world-{meta['id']}"] = meta["welcome"]
        lv_json = [l.to_json() for l in levels]
        for l in lv_json:
            for a in l["acts"]:
                kinds[a["t"]] = kinds.get(a["t"], 0) + 1
            total_acts += len(l["acts"])
        walk(lv_json, speech)
        walk(meta["hints"], speech)
        with open(os.path.join(out, f"world-{meta['id']}.json"), "w", encoding="utf-8") as f:
            json.dump({"id": meta["id"], "levels": lv_json}, f, ensure_ascii=False, separators=(",", ":"))
        meta["levels"] = [{"id": l["id"], "title": l["title"], "emoji": l["emoji"], "n": len(l["acts"])} for l in lv_json]
        index["worlds"].append(meta)
    # عبارات الواجهة
    ui = {k: {"s": norm(v)} for k, v in UI.items()}
    ui["praise"] = [{"s": s} for s in PRAISE]
    ui["praiseF"] = [{"s": s} for s in PRAISE_F]
    ui["praiseM"] = [{"s": s} for s in PRAISE_M]
    ui["retry"] = [{"s": s} for s in RETRY]
    walk(ui, speech)
    json.dump(ui, open(os.path.join(out, "ui.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    # الملصقات
    stickers = []
    for aid, name, emoji, items in ALBUMS:
        stickers.append({"id": aid, "name": name, "emoji": E(emoji), "items": [{"e": E(e), "x": x, "s": x} for e, x in items]})
        UI.setdefault(f"album-{aid}", name)
    walk(stickers, speech)
    json.dump({"albums": stickers}, open(os.path.join(out, "stickers.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(index, open(os.path.join(out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    # قائمة الصوت
    sl = sorted(speech)
    json.dump([{"l": l, "s": s, "h": sid(l, s)} for l, s in sl],
              open(os.path.join(HERE, "speech_list.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    # الأيقونات: ما في المحتوى + ما في شيفرة الواجهة
    used = set(common.USED_EMOJI)
    emo_re = re.compile("[\U0001F000-\U0001FAFF☀-➿⬀-⯿⌀-⏿©®‼⁉™ℹ↔-↪〰〽㊗㊙️‍]+")
    for sub in ("js", "css", "index.html"):
        p = os.path.join(ROOT, sub)
        files = [p] if os.path.isfile(p) else [os.path.join(dp, f) for dp, _, fs in os.walk(p) for f in fs if f.endswith((".js", ".css", ".html"))]
        for fp in files:
            txt = open(fp, encoding="utf-8").read()
            for mt in emo_re.findall(txt):
                for ch in re.findall(r"[\U0001F000-\U0001FAFF☀-➿⬀-⯿]️?(?:‍[\U0001F000-\U0001FAFF☀-➿⬀-⯿]️?)*", mt):
                    try:
                        used.add(E(ch)) or None
                    except ValueError:
                        pass
    ed = os.path.join(ROOT, "assets", "emoji")
    shutil.rmtree(ed, ignore_errors=True)
    os.makedirs(ed)
    n = 0
    for e in sorted(used):
        a = common.cp(e)
        full = "-".join(f"{ord(c):x}" for c in e)
        src = None
        for cand in (a, full):
            if os.path.exists(f"{common.TW}/{cand}.svg"):
                src = f"{common.TW}/{cand}.svg"
                break
        if src:
            shutil.copy(src, os.path.join(ed, a + ".svg"))
            n += 1
    print(f"الأنشطة: {total_acts} | أنواعها: {kinds}")
    print(f"النصوص المنطوقة: {len(sl)} (عربي {sum(1 for l, _ in sl if l == 'ar')}، إنكليزي {sum(1 for l, _ in sl if l == 'en')})")
    print(f"الأيقونات المنسوخة: {n}")
    sz = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f"حجم data/: {sz / 1024:.0f} KB")


if __name__ == "__main__":
    main()
