# -*- coding: utf-8 -*-
"""مدينة الإنكليزي: مفردات «English for Iraq» للصف الأول: تحيات، ألوان، أرقام، حيوانات، طعام، عائلة، مدرسة، حروف."""
from common import *

HINTS = ["لنستمع إلى الكلمة مرة أخرى", "لننظر إلى الصور بعناية", "لننطق الكلمة بصوت عالٍ"]
LETTER_SAY = dict(A="ay", B="bee", C="see", D="dee", E="ee", F="eff", G="jee", H="aitch", I="eye", J="jay", K="kay", L="el", M="em",
                  N="en", O="oh", P="pee", Q="cue", R="ar", S="ess", T="tee", U="you", V="vee", W="double you", X="ex", Y="why", Z="zed")
ABC_WORDS = dict(A=("Apple", "🍎"), B=("Ball", "⚽"), C=("Cat", "🐱"), D=("Dog", "🐶"), E=("Egg", "🥚"), F=("Fish", "🐟"), G=("Grapes", "🍇"),
                 H=("Hat", "🎩"), I=("Ice cream", "🍦"), J=("Juice", "🧃"), K=("Kite", "🪁"), L=("Lion", "🦁"), M=("Monkey", "🐒"),
                 N=("Nose", "👃"), O=("Orange", "🍊"), P=("Pig", "🐷"), Q=("Queen", "👸"), R=("Rabbit", "🐰"), S=("Sun", "☀️"),
                 T=("Tree", "🌳"), U=("Umbrella", "☂️"), V=("Van", "🚐"), W=("Water", "💧"), X=("X-ray", "🩻"), Y=("Yo-yo", "🪀"), Z=("Zebra", "🦓"))

CATS = {
    "hello": ("التحيات", "👋", [("Hello", "مرحبًا", "👋"), ("Goodbye", "مع السلامة", "🖐️"), ("Good morning", "صباح الخير", "🌅"),
                                ("Good night", "تصبح على خير", "🌙"), ("Thank you", "شكرًا", "🙏"), ("Please", "من فضلك", "🤲"),
                                ("Sorry", "آسف", "😔"), ("Yes", "نعم", "✅"), ("No", "لا", "❌")]),
    "animals": ("الحيوانات", "🐱", [("cat", "قطة", "🐱"), ("dog", "كلب", "🐶"), ("bird", "عصفور", "🐦"), ("fish", "سمكة", "🐟"), ("cow", "بقرة", "🐄"),
                                  ("horse", "حصان", "🐴"), ("sheep", "خروف", "🐑"), ("duck", "بطة", "🦆"), ("lion", "أسد", "🦁"), ("elephant", "فيل", "🐘"),
                                  ("monkey", "قرد", "🐒"), ("camel", "جمل", "🐪"), ("rabbit", "أرنب", "🐰"), ("chicken", "دجاجة", "🐔")]),
    "food": ("الطعام", "🍎", [("apple", "تفاحة", "🍎"), ("banana", "موزة", "🍌"), ("orange", "برتقالة", "🍊"), ("grapes", "عنب", "🍇"),
                              ("strawberry", "فراولة", "🍓"), ("lemon", "ليمونة", "🍋"), ("watermelon", "بطيخ", "🍉"), ("milk", "حليب", "🥛"),
                              ("bread", "خبز", "🍞"), ("egg", "بيضة", "🥚"), ("water", "ماء", "💧"), ("cake", "كعكة", "🍰"), ("rice", "رز", "🍚"), ("juice", "عصير", "🧃")]),
    "family": ("عائلتي وجسمي", "👨‍👩‍👧", [("mum", "أمي", "👩"), ("dad", "أبي", "👨"), ("brother", "أخي", "👦"), ("sister", "أختي", "👧"), ("baby", "الطفل الرضيع", "👶"),
                                       ("grandma", "جدتي", "👵"), ("grandpa", "جدي", "👴"), ("eye", "عين", "👁️"), ("ear", "أذن", "👂"), ("nose", "أنف", "👃"),
                                       ("mouth", "فم", "👄"), ("hand", "يد", "✋"), ("foot", "قدم", "🦶")]),
    "school": ("المدرسة", "🎒", [("book", "كتاب", "📖"), ("pen", "قلم حبر", "🖊️"), ("pencil", "قلم رصاص", "✏️"), ("bag", "حقيبة", "🎒"), ("ruler", "مسطرة", "📏"),
                                ("school", "مدرسة", "🏫"), ("teacher", "معلم", "🧑‍🏫"), ("chair", "كرسي", "🪑"), ("scissors", "مقص", "✂️"), ("ball", "كرة", "⚽")]),
}
COLORS = [("red", "أحمر", "#e63946"), ("blue", "أزرق", "#1d70d8"), ("green", "أخضر", "#2fb344"), ("yellow", "أصفر", "#ffd23f"),
          ("orange", "برتقالي", "#ff8c1a"), ("pink", "وردي", "#ff7eb6"), ("black", "أسود", "#222222"), ("white", "أبيض", "#ffffff"),
          ("purple", "بنفسجي", "#8b5cf6"), ("brown", "بني", "#8d5524")]
NUMS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
OBJS = ["🍎", "⭐", "🐟", "🎈", "🚗", "🌸", "🐥", "⚽", "🍓", "🦋"]
PLURAL = {"grapes"}
WHERE = {"animals": "Where is the {}?", "food": "Where is the {}?", "school": "Where is the {}?", "family": "Where is my {}?"}


def en(w, **k):
    return O(x=w, s=w, l="en", **k)


def vten(w):
    return {"x": w, "big": 1, "s": w, "l": "en"}


def ar_(w):
    return O(x=w, s=w)


def pic_en(w, e):
    return O(e=e, s=w, l="en")


def say_letter(c):
    return LETTER_SAY[c.upper()]


def let(c):
    return O(x=c, s=say_letter(c), l="en")


def vocab_level(idx, key, title_emoji=None):
    title, emoji, words = CATS[key]
    lv = Level("e", idx, title, emoji)
    r = rng("eng", key)
    ws = words[:]
    r.shuffle(ws)
    tmpl = WHERE.get(key)
    for w in ws[:6]:
        en_, ar, em = w
        others = [x for x in words if x[0] != en_]
        r.shuffle(others)
        if key == "hello":
            lv.add(pick(Q(f"ماذا تعني كلمة {ar}؟") if False else Q("ماذا تعني هذه الكلمة؟"), O(x=ar, s=ar), [O(x=x[1], s=x[1]) for x in others[:2]], pic=[vten(en_)], seed=en_, sk=f"en:{en_}", hint=HINTS[0], size="xl"))
        else:
            q = Q(tmpl.format(en_) if key != "food" or en_ not in PLURAL else "Where are the grapes?", l="en")
            lv.add(choice(q, [pic_en(en_, em)] + [pic_en(x[0], x[2]) for x in others[:2]], 0, listen=True, sk=f"en:{en_}", hint=Q(HINTS[0])))
    for w in ws[6:12]:
        en_, ar, em = w
        others = [x for x in words if x[0] != en_]
        r.shuffle(others)
        if key == "hello":
            lv.add(pick(Q(f"كيف نقول {ar} بالإنكليزية؟"), en(en_), [en(x[0]) for x in others[:2]], seed=en_, sk=f"en:{en_}", hint=HINTS[0]))
        else:
            lv.add(choice(Q("ما اسم هذه الصورة بالإنكليزية؟"), [en(en_)] + [en(x[0]) for x in others[:2]], 0, pic=[vemo(em)], sk=f"en:{en_}", hint=Q(HINTS[2]), size="xl"))
    for w in ws[:4]:
        en_, ar, em = w
        others = [x for x in words if x[0] != en_]
        r.shuffle(others)
        lv.add(pick(Q(f"كيف نقول {ar} بالإنكليزية؟"), en(en_), [en(x[0]) for x in others[:2]], seed="b" + en_, sk=f"en:{en_}", hint=HINTS[0]))
    for w in ws[4:6]:
        en_, ar, em = w
        others = [x for x in words if x[0] != en_]
        r.shuffle(others)
        lv.add(pick(Q("ماذا تعني هذه الكلمة؟"), O(x=ar, s=ar), [O(x=x[1], s=x[1]) for x in others[:2]], pic=[vten(en_)], seed="c" + en_, sk=f"en:{en_}", hint=HINTS[0], size="xl"))
    if key != "hello":
        for w in ws[:2]:
            en_, ar, em = w
            others = [x for x in words if x[0] != en_]
            r.shuffle(others)
            items = [(O(e=em, s=""), True)] * 3 + [(O(e=x[2], s=""), False) for x in (others * 2)[:5]]
            r.shuffle(items)
            lv.add(balloons(Q(f"Pop the {en_}!" if en_ not in PLURAL else "Pop the grapes!", l="en"), items, 3, sk=f"en:{en_}"))
    mp = ws[:4]
    lv.add(match(Q("لنصل كل كلمة بصورتها"), [(en(w[0]), O(e=w[2], s="")) for w in mp]))
    lv.add(memory(Q("لنكتشف الكلمة وصورتها"), [(en(w[0]), O(e=w[2], s="")) for w in ws[4:7]]))
    sp = [w for w in words if 3 <= len(w[0]) <= 4 and " " not in w[0]]
    r.shuffle(sp)
    for w in sp[:2]:
        letters = list(w[0])
        dis = [c for c in "aeiourstnmplkb" if c not in letters]
        r.shuffle(dis)
        tiles = [let(c) for c in letters] + [let(c) for c in dis[:2]]
        lv.add(build(Q(f"Spell {w[0]}!", l="en"), O(x=w[0], e=w[2], s=w[0], l="en"), tiles, "ltr", sk=f"en:{w[0]}"))
    return lv


def colors_level(idx):
    lv = Level("e", idx, "الألوان", "🎨")
    r = rng("eng", "colors")
    cs = COLORS[:]
    r.shuffle(cs)
    sw = lambda c: O(c=c[2], s=c[0], l="en")
    for c in cs[:6]:
        others = [x for x in COLORS if x[0] != c[0]]
        r.shuffle(others)
        lv.add(choice(Q(f"Where is {c[0]}?", l="en"), [sw(c)] + [sw(x) for x in others[:2]], 0, listen=True, sk=f"en:{c[0]}", hint=Q(HINTS[0]), size="xl"))
    for c in cs[6:10]:
        others = [x for x in COLORS if x[0] != c[0]]
        r.shuffle(others)
        lv.add(choice(Q("ما اسم هذا اللون بالإنكليزية؟"), [en(c[0])] + [en(x[0]) for x in others[:2]], 0, pic=[{"c": c[2], "sh": "circle"}], sk=f"en:{c[0]}", hint=Q(HINTS[2])))
    for c in cs[:4]:
        others = [x for x in COLORS if x[0] != c[0]]
        r.shuffle(others)
        lv.add(pick(Q(f"كيف نقول اللون {c[1]} بالإنكليزية؟"), en(c[0]), [en(x[0]) for x in others[:2]], seed=c[0], sk=f"en:{c[0]}", hint=HINTS[0]))
    for c in cs[:2]:
        others = [x for x in COLORS if x[0] != c[0]]
        r.shuffle(others)
        items = [(O(c=c[2], s="", l=None), True)] * 3 + [(O(c=x[2], s=""), False) for x in others[:5]]
        r.shuffle(items)
        lv.add(balloons(Q(f"Pop the {c[0]} balloons!", l="en"), items, 3, sk=f"en:{c[0]}"))
    lv.add(match(Q("لنصل كل لون باسمه"), [(O(c=c[2], s=""), en(c[0])) for c in cs[:4]]))
    lv.add(memory(Q("لنكتشف اللون واسمه"), [(O(c=c[2], s=""), en(c[0])) for c in cs[4:7]]))
    objs = [("🍎", "red"), ("🍌", "yellow"), ("🥬", "green"), ("🌊", "blue"), ("🍊", "orange"), ("🐻", "brown")]
    for em, cn in objs[:3]:
        col = [c for c in COLORS if c[0] == cn][0]
        others = [x for x in COLORS if x[0] != cn]
        r.shuffle(others)
        lv.add(choice(Q("ما لون هذه الصورة؟"), [en(cn)] + [en(x[0]) for x in others[:2]], 0, pic=[vemo(em)], sk=f"en:{cn}", hint=Q(HINTS[1]), size="xl"))
    return lv


def numbers_level(idx):
    lv = Level("e", idx, "الأرقام", "🔢")
    r = rng("eng", "numbers")
    ns = list(range(1, 11))
    for n in r.sample(ns, 6):
        others = [x for x in ns if x != n]
        r.shuffle(others)
        lv.add(choice(Q(f"Where is number {NUMS[n - 1]}?", l="en"), [O(x=ar(n), s=NUMS[n - 1], l="en", sk=f"en:{NUMS[n - 1]}")] + [O(x=ar(o), s=NUMS[o - 1], l="en") for o in others[:2]], 0,
                      listen=True, size="xl", ltr=1, hint=Q(HINTS[0]), sk=f"en:{NUMS[n - 1]}"))
    for n in r.sample(ns, 5):
        others = [x for x in ns if x != n]
        r.shuffle(others)
        e = OBJS[r.randrange(len(OBJS))]
        lv.add({"t": "count", "q": Q("How many?", l="en"), "e": E(e), "n": n, "ch": [en(NUMS[n - 1])] + [en(NUMS[o - 1]) for o in others[:2]], "a": 0, "sk": f"en:{NUMS[n - 1]}"})
    for n in r.sample(ns, 4):
        others = [x for x in ns if x != n]
        r.shuffle(others)
        lv.add(choice(Q("ما اسم هذا الرقم بالإنكليزية؟"), [en(NUMS[n - 1])] + [en(NUMS[o - 1]) for o in others[:2]], 0, pic=[vtxt(ar(n))], size="xl", sk=f"en:{NUMS[n - 1]}"))
    for n in r.sample(ns, 2):
        others = [x for x in ns if x != n]
        items = [(O(x=ar(n), s="" ), True)] * 3 + [(O(x=ar(o), s=""), False) for o in others[:5]]
        r.shuffle(items)
        lv.add(balloons(Q(f"Pop number {NUMS[n - 1]}!", l="en"), items, 3))
    lv.add(order(Q("Count from one!", l="en"), [O(x=ar(n), s=NUMS[n - 1], l="en") for n in range(1, 6)]))
    lv.add(order(Q("Count from six!", l="en"), [O(x=ar(n), s=NUMS[n - 1], l="en") for n in range(6, 11)]))
    lv.add(match(Q("لنصل كل رقم باسمه"), [(O(x=ar(n), s=""), en(NUMS[n - 1])) for n in r.sample(ns, 4)]))
    lv.add(memory(Q("لنكتشف الرقم واسمه"), [(O(x=ar(n), s=""), en(NUMS[n - 1])) for n in r.sample(ns, 3)]))
    return lv


def abc_level(idx, letters, title):
    lv = Level("e", idx, title, "🔤")
    r = rng("eng", "abc", idx)
    L = list(letters)
    allL = [c for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
    for c in r.sample(L, 8):
        others = [x for x in L if x != c]
        r.shuffle(others)
        lv.add(choice(Q(f"Where is the letter {c}?", l="en"), [let(c)] + [let(o) for o in others[:2]], 0, listen=True, size="xl", ltr=1, sk=f"abc:{c}", hint=Q(HINTS[0])))
    for c in r.sample(L, 4):
        w, em = ABC_WORDS[c]
        others = [x for x in allL if x != c]
        r.shuffle(others)
        lv.add(choice(Q(f"{w} starts with…", l="en"), [let(c)] + [let(o) for o in others[:2]], 0, pic=[vemo(em), vten(w)], size="xl", ltr=1, sk=f"abc:{c}", hint=Q(HINTS[2])))
    for c in L[:6]:
        lv.add(trace(Q(f"Let's trace the letter {c}!", l="en"), c, "en", sk=f"abc:{c}"))
    for c in L[6:10]:
        lv.add(trace(Q(f"Let's trace the small letter {c.lower()}!", l="en"), c.lower(), "en", sk=f"abc:{c}"))
    for c in r.sample(L, 2):
        others = [x for x in L if x != c]
        items = [(let(c), True)] * 3 + [(let(o), False) for o in others[:5]]
        r.shuffle(items)
        lv.add(balloons(Q(f"Pop the letter {c}!", l="en"), items, 3, sk=f"abc:{c}"))
    lv.add(match(Q("لنصل الحرف الكبير بالحرف الصغير"), [(let(c), O(x=c.lower(), s=say_letter(c), l="en")) for c in r.sample(L, 4)]))
    lv.add(match(Q("لنصل الحرف الكبير بالحرف الصغير"), [(let(c), O(x=c.lower(), s=say_letter(c), l="en")) for c in r.sample(L, 4)]))
    lv.add(memory(Q("لنكتشف الحرف وصورته"), [(let(c), O(e=ABC_WORDS[c][1], s=ABC_WORDS[c][0], l="en")) for c in r.sample(L, 3)]))
    lv.add(order(Q("Say the ABC!", l="en"), [let(c) for c in L[:5]]))
    return lv


def build_levels():
    return [vocab_level(1, "hello"), colors_level(2), numbers_level(3), vocab_level(4, "animals"), vocab_level(5, "food"),
            vocab_level(6, "family"), vocab_level(7, "school"), abc_level(8, "ABCDEFGHIJKLM", "الحروف A - M"), abc_level(9, "NOPQRSTUVWXYZ", "الحروف N - Z")]


META = {"id": "e", "name": "مدينة الإنكليزي", "short": "English", "icon": "ABC", "color": "#c28a10", "sky": ["#fff1c2", "#ffe08a"], "emoji": "🔠", "hints": HINTS}
