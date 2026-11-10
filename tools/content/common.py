# -*- coding: utf-8 -*-
"""أدوات مشتركة لبناء محتوى «مدينة ديمة التعليمية».

العقد بين المولّد والواجهة:
  * كل كائن له الحقل `s` هو نصّ منطوق (يُنطق بالصوت) و`l` لغته (ar | en).
  * الحقل `x` هو النص المعروض، و`e` أيقونة Twemoji، و`c` لون، و`sh` شكل، و`n` عدد عناصر.
"""
import hashlib
import os
import random

TW = os.environ.get("TWEMOJI_DIR", "/home/claude/npmwork/node_modules/@twemoji/svg")
USED_EMOJI = set()

AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"
NUM_WORDS = ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة",
             "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر",
             "ثمانية عشر", "تسعة عشر", "عشرون"]
# مؤنّث (للمعدود المؤنث: كم تفاحة؟ → ثلاث تفاحات) نكتفي بالمذكّر في العدّ المجرّد
EN_NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


def ar(n):
    return "".join(AR_DIGITS[int(c)] for c in str(n))


def cp(e):
    return "-".join(f"{ord(c):x}" for c in e if ord(c) != 0xFE0F)


def E(e):
    """يتحقق من وجود الأيقونة ويسجّلها لتُنسخ إلى assets/emoji."""
    f = cp(e)
    if not os.path.exists(f"{TW}/{f}.svg"):
        alt = "-".join(f"{ord(c):x}" for c in e)
        if not os.path.exists(f"{TW}/{alt}.svg"):
            raise ValueError(f"أيقونة غير موجودة: {e!r} ({f})")
    USED_EMOJI.add(e)
    return e


def rng(*parts):
    h = hashlib.sha1("|".join(map(str, parts)).encode()).hexdigest()
    return random.Random(int(h[:12], 16))


def O(x=None, e=None, s="__", l=None, c=None, sh=None, n=None, **k):
    """خيار/عنصر. s='__' تعني: انطق x كما هو. s='' تعني: بلا نطق."""
    d = {}
    if x is not None:
        d["x"] = x
    if e:
        d["e"] = E(e)
    if s == "__":
        s = x if x is not None else None
    if s:
        d["s"] = s
    if l and l != "ar":
        d["l"] = l
    if c:
        d["c"] = c
    if sh:
        d["sh"] = sh
    if n is not None:
        d["n"] = n
    d.update(k)
    return d


def Q(x, s=None, l=None):
    d = {"x": x, "s": s or x}
    if l and l != "ar":
        d["l"] = l
    return d


# ---- عناصر العرض البصري (vis) ----
def grp(e, n, k=0):
    """مجموعة n من الأيقونة e، منها k مشطوبة."""
    d = {"e": E(e), "n": n}
    if k:
        d["k"] = k
    return d


def op(x):
    return {"op": x}


def vtxt(x, big=True):
    return {"x": x, "big": 1 if big else 0}


def vemo(e):
    return {"e": E(e), "n": 1}


class Level:
    def __init__(self, wid, idx, title, emoji):
        self.wid, self.idx, self.title, self.emoji = wid, idx, title, E(emoji)
        self.id = f"{wid}{idx}"
        self.acts = []

    def add(self, act):
        act["id"] = f"{self.id}-{len(self.acts) + 1:02d}"
        self.acts.append(act)
        return act

    def to_json(self):
        return {"id": self.id, "title": self.title, "emoji": self.emoji, "acts": self.acts}


# ---- أنواع الأنشطة ----
def choice(q, ch, a, pic=None, listen=False, sk=None, hint=None, size=None, fixed=False, cols=None, **extra):
    d = {"t": "choice", "q": q, "ch": ch, "a": a}
    d.update(extra)
    if pic:
        d["pic"] = pic
    if listen:
        d["listen"] = 1
    if sk:
        d["sk"] = sk
    if hint:
        d["hint"] = hint
    if size:
        d["size"] = size
    if fixed:
        d["fixed"] = 1
    if cols:
        d["cols"] = cols
    return d


def mk_choice(q, correct, pool, k=3, seed="", **kw):
    """يبني سؤال اختيار: الإجابة الصحيحة + (k-1) مشتّتات من pool."""
    r = rng("mk", seed, q.get("x"))
    cand = [p for p in pool if p.get("x") != correct.get("x") or p.get("e") != correct.get("e")]
    cand = [p for p in cand if (p.get("x"), p.get("e")) != (correct.get("x"), correct.get("e"))]
    r.shuffle(cand)
    wrong = cand[: k - 1]
    ch = [correct] + wrong
    return choice(q, ch, 0, **kw)


def count(q, e, n, ch, sk=None, noun=None):
    d = {"t": "count", "q": q, "e": E(e), "n": n, "ch": ch, "a": ch.index(n) if isinstance(n, int) and n in ch else 0}
    # ch قائمة أعداد صحيحة؛ تُحوَّل في الواجهة إلى أرقام
    if sk:
        d["sk"] = sk
    return d


def trace(q, glyph, kind="ar", sk=None, shape=None):
    d = {"t": "trace", "q": q, "g": glyph, "kind": kind}
    if shape:
        d["shape"] = shape
    if sk:
        d["sk"] = sk
    return d


def balloons(q, items, need=None, sk=None):
    """items: قائمة (O, ok)."""
    its = [{**o, "ok": 1 if ok else 0} for o, ok in items]
    d = {"t": "balloons", "q": q, "items": its, "need": need or sum(1 for _, ok in items if ok)}
    if sk:
        d["sk"] = sk
    return d


def match(q, pairs, sk=None):
    d = {"t": "match", "q": q, "pairs": [{"a": a, "b": b} for a, b in pairs]}
    if sk:
        d["sk"] = sk
    return d


def memory(q, pairs, sk=None):
    d = {"t": "memory", "q": q, "pairs": [{"a": a, "b": b} for a, b in pairs]}
    if sk:
        d["sk"] = sk
    return d


def sort(q, bins, items, sk=None):
    d = {"t": "sort", "q": q, "bins": bins, "items": [{**o, "bin": b} for o, b in items]}
    if sk:
        d["sk"] = sk
    return d


def build(q, word, tiles, dirn="rtl", sk=None):
    d = {"t": "build", "q": q, "word": word, "tiles": tiles, "dir": dirn}
    if sk:
        d["sk"] = sk
    return d


def order(q, items, sk=None):
    d = {"t": "order", "q": q, "items": items}
    if sk:
        d["sk"] = sk
    return d


def story(title, pages, qa):
    return {"t": "story", "title": title, "pages": pages, "qa": qa}


def uniq(seq, key=lambda o: o):
    seen, out = set(), []
    for o in seq:
        k = key(o)
        if k not in seen:
            seen.add(k)
            out.append(o)
    return out


# ---- أدوات مختصرة لكتابة المحتوى ----
def T(label, emoji=None, spoken=None, lang=None, **k):
    """خيار من (نص، أيقونة، نطق)."""
    return O(x=label, e=emoji, s=spoken if spoken is not None else label, l=lang, **k)


def pick(q, good, bads, k=3, seed="", hint=None, sk=None, size=None, pic=None, listen=False, fixed=False, **kw):
    """good و bads عناصر T. يختار k-1 مشتّتًا عشوائيًا ثابتًا."""
    q = Q(q) if isinstance(q, str) else q
    r = rng("pick", seed, q["x"])
    b = list(bads)
    r.shuffle(b)
    return choice(q, [good] + b[: k - 1], 0, hint=Q(hint) if isinstance(hint, str) else hint, sk=sk, size=size, pic=pic,
                  listen=listen, fixed=fixed, **kw)


def yn(q, truth, hint=None, sk=None):
    return choice(Q(q), [O(x="نعم", e="✅"), O(x="لا", e="❌")], 0 if truth else 1, fixed=True, size="yn", sk=sk,
                  hint=Q(hint) if hint else None)


def sorting(q, bins, items):
    """bins: قائمة T، items: قائمة (T, رقم الخانة)."""
    return sort(Q(q), bins, items)
