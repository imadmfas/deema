# -*- coding: utf-8 -*-
"""مدينة الأرقام: عدّ، أرقام، مقارنة، جمع، طرح، أشكال، أنماط، حتى ٢٠."""
from common import *

OBJ = [("🍎", "تفاحة"), ("🍌", "موزة"), ("⭐", "نجمة"), ("🎈", "بالونة"), ("🐟", "سمكة"), ("🚗", "سيارة"),
       ("🌸", "وردة"), ("🍓", "فراولة"), ("🐥", "كتكوت"), ("⚽", "كرة"), ("🧁", "كعكة"), ("🦋", "فراشة"),
       ("🐞", "دعسوقة"), ("🐱", "قطة"), ("🦆", "بطة"), ("🌳", "شجرة")]
PAL = ["#ef476f", "#ffb703", "#06d6a0", "#118ab2", "#9b5de5", "#ff7a3d"]
SHAPES = {"circle": "دائرة", "square": "مربع", "triangle": "مثلث", "rectangle": "مستطيل", "star": "نجمة", "heart": "قلب"}
HINTS = ["لنعدّ معًا بإصبعنا واحدًا واحدًا", "لننظر إلى الأرقام ونفكر قليلًا", "لنتخيل خط الأعداد من الأصغر إلى الأكبر"]


def numo(n, **k):
    return O(x=ar(n), s=NUM_WORDS[n], sk=f"n:{n}", **k)


def near(n, lo, hi, k, r):
    c = [x for x in range(max(lo, n - 3), min(hi, n + 3) + 1) if x != n]
    r.shuffle(c)
    return c[:k]


def nchoice(q, ans, lo, hi, r, **kw):
    ds = near(ans, lo, hi, 2, r)
    return choice(q, [numo(ans)] + [numo(d) for d in ds], 0, sk=f"n:{ans}", size="xl", ltr=1, **kw)


def count_act(n, r, lo=1, hi=10):
    e, noun = OBJ[r.randrange(len(OBJ))]
    ds = near(n, lo, hi, 2, r)
    ch = [numo(n)] + [numo(d) for d in ds]
    return {"t": "count", "q": Q(f"كم {noun} هنا؟"), "e": E(e), "n": n, "ch": ch, "a": 0, "sk": f"n:{n}"}


def groups_choice(kind, a, b, r):
    """أي مجموعة أكثر/أقل: خياران كمجموعات."""
    e = OBJ[r.randrange(len(OBJ))][0]
    e2 = e
    g1, g2 = O(e=e, n=a, s=""), O(e=e2, n=b, s="")
    if kind == "more":
        ans = 0 if a > b else 1
        q = Q("أي مجموعة فيها عدد أكبر؟")
    else:
        ans = 0 if a < b else 1
        q = Q("أي مجموعة فيها عدد أقل؟")
    return choice(q, [g1, g2], ans, fixed=True, size="grp", sk="cmp")


def num_levels(lid, title, emoji, lo, hi, seed):
    lv = Level("m", lid, title, emoji)
    r = rng("math", lid)
    nums = list(range(lo, hi + 1))
    # عدّ الأشياء
    for n in nums:
        lv.add(count_act(n, r, lo=max(0, lo - 1), hi=hi + 1))
    # أين الرقم؟
    for n in nums[:4] if len(nums) > 4 else nums:
        others = [x for x in nums if x != n]
        r.shuffle(others)
        lv.add(choice(Q(f"أين الرقم {NUM_WORDS[n]}؟"), [numo(n)] + [numo(o) for o in others[:2]], 0, size="xl", sk=f"n:{n}", ltr=1, hint=Q(HINTS[1])))
    # كمية → رقم
    for n in r.sample(nums, min(3, len(nums))):
        e = OBJ[r.randrange(len(OBJ))][0]
        lv.add(nchoice(Q("أي رقم يدل على هذا العدد؟"), n, lo, hi, r, pic=[grp(e, n)], hint=Q(HINTS[0])))
    # رقم → كمية
    for n in r.sample(nums, min(3, len(nums))):
        e = OBJ[r.randrange(len(OBJ))][0]
        ds = near(n, lo, hi, 2, r)
        ch = [O(e=e, n=n, s="")] + [O(e=e, n=d, s="") for d in ds]
        lv.add(choice(Q(f"أي مجموعة فيها {NUM_WORDS[n]}؟"), ch, 0, pic=[vtxt(ar(n))], size="grp", sk=f"n:{n}", hint=Q(HINTS[0])))
    # تتبع
    if hi <= 10:
        for n in nums:
            if n == 0:
                continue
            lv.add(trace(Q(f"لنتتبّع الرقم {NUM_WORDS[n]} بإصبعنا"), ar(n), "num", sk=f"n:{n}"))
    # بالونات
    for n in r.sample(nums, 2):
        others = [x for x in nums if x != n]
        items = [(numo(n), True)] * 3 + [(numo(o), False) for o in (others * 2)[:5]]
        r.shuffle(items)
        lv.add(balloons(Q(f"أين البالونات التي فيها الرقم {NUM_WORDS[n]}؟"), items, 3, sk=f"n:{n}"))
    # ترتيب
    sub = sorted(r.sample(nums, min(5, len(nums))))
    lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in sub]))
    # مطابقة وذاكرة
    mp = r.sample(nums, min(4, len(nums)))
    lv.add(match(Q("لنصل كل رقم بعدد الأشياء المناسب"), [(numo(n), O(e=OBJ[i][0], n=n, s="")) for i, n in enumerate(mp)]))
    mm = r.sample(nums, min(3, len(nums)))
    lv.add(memory(Q("لنكتشف الرقم وعدد الأشياء"), [(numo(n), O(e=OBJ[3 + i][0], n=n, s="")) for i, n in enumerate(mm)]))
    return lv


def lvl_before_after():
    lv = Level("m", 3, "الأرقام من ٠ إلى ١٠", "🔟")
    r = rng("math", 3)
    for n in range(0, 10):
        a = n + 1
        lv.add(nchoice(Q(f"ما العدد الذي يأتي بعد {NUM_WORDS[n]}؟"), a, 0, 10, r, pic=[vtxt(ar(n)), vtxt("؟")], hint=Q(HINTS[2])))
    for n in range(1, 11):
        a = n - 1
        lv.add(nchoice(Q(f"ما العدد الذي يأتي قبل {NUM_WORDS[n]}؟"), a, 0, 10, r, pic=[vtxt("؟"), vtxt(ar(n))], hint=Q(HINTS[2])))
    for n in range(1, 10):
        lv.add(nchoice(Q(f"ما العدد الذي بين {NUM_WORDS[n - 1]} و{NUM_WORDS[n + 1]}؟") if n - 1 >= 0 else Q(""), n, 0, 10, r,
                       pic=[vtxt(ar(n - 1)), vtxt("؟"), vtxt(ar(n + 1))], hint=Q(HINTS[2])))
    lv.add(trace(Q("لنتتبّع الرقم صفر بإصبعنا"), "٠", "num"))
    lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in sorted(r.sample(range(0, 11), 6))]))
    lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in sorted(r.sample(range(0, 11), 6))]))
    lv.acts = [a for a in lv.acts if a.get("q", {}).get("x")]
    # إعادة ترقيم المعرّفات بعد الحذف
    for i, a in enumerate(lv.acts):
        a["id"] = f"{lv.id}-{i + 1:02d}"
    return lv


def lvl_compare():
    lv = Level("m", 4, "أكثر وأقل", "⚖️")
    r = rng("math", 4)
    pairs = [(a, b) for a in range(1, 10) for b in range(1, 10) if a != b and abs(a - b) <= 4]
    r.shuffle(pairs)
    for a, b in pairs[:5]:
        lv.add(groups_choice("more", a, b, r))
    for a, b in pairs[5:9]:
        lv.add(groups_choice("less", a, b, r))
    for a, b in pairs[9:12]:
        lv.add(choice(Q("أيهما أكبر؟"), [numo(a), numo(b)], 0 if a > b else 1, size="xl", sk="cmp", ltr=1, fixed=True))
    for a, b in pairs[12:15]:
        lv.add(choice(Q("أيهما أصغر؟"), [numo(a), numo(b)], 0 if a < b else 1, size="xl", sk="cmp", ltr=1, fixed=True))
    sizes = [("🐘", "الفيل", "🐭", "الفأر", "أيهما أكبر حجمًا؟"), ("🦒", "الزرافة", "🐢", "السلحفاة", "أيهما أطول؟"),
             ("🐋", "الحوت", "🐟", "السمكة الصغيرة", "أيهما أكبر حجمًا؟"), ("🌳", "الشجرة", "🌸", "الوردة", "أيهما أطول؟")]
    for big, bn, small, sn, q in sizes:
        lv.add(choice(Q(q), [O(x=bn, e=big), O(x=sn, e=small)], 0, sk="size", hint=Q("لننظر إلى الصورتين ونقارن بينهما")))
    return lv


def lvl_add():
    lv = Level("m", 5, "الجمع", "➕")
    r = rng("math", 5)
    combos = [(a, b) for a in range(1, 5) for b in range(1, 5) if a + b <= 5]
    r.shuffle(combos)
    for a, b in combos * 2:
        if len(lv.acts) >= 14:
            break
        e = OBJ[r.randrange(len(OBJ))][0]
        lv.add(nchoice(Q(f"كم يساوي {NUM_WORDS[a]} زائد {NUM_WORDS[b]}؟"), a + b, 1, 6, r,
                       pic=[grp(e, a), op("+"), grp(e, b), op("="), vtxt("؟")], hint=Q("لنعدّ الأشياء كلها معًا")))
    lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in range(1, 6)]))
    return lv


def lvl_sub():
    lv = Level("m", 6, "الطرح", "➖")
    r = rng("math", 6)
    combos = [(a, b) for a in range(2, 6) for b in range(1, a)]
    r.shuffle(combos)
    for a, b in combos * 2:
        if len(lv.acts) >= 14:
            break
        e = OBJ[r.randrange(len(OBJ))][0]
        lv.add(nchoice(Q(f"كم يساوي {NUM_WORDS[a]} ناقص {NUM_WORDS[b]}؟"), a - b, 0, 5, r,
                       pic=[grp(e, a, b), vtxt(f"{ar(a)} − {ar(b)} = ؟")], hint=Q("لنشطب الأشياء ثم نعدّ ما بقي")))
    return lv


def lvl_mix10():
    lv = Level("m", 7, "الجمع والطرح حتى ١٠", "🧮")
    r = rng("math", 7)
    adds = [(a, b) for a in range(2, 9) for b in range(2, 9) if 6 <= a + b <= 10]
    r.shuffle(adds)
    for a, b in adds[:6]:
        e = OBJ[r.randrange(len(OBJ))][0]
        lv.add(nchoice(Q(f"كم يساوي {NUM_WORDS[a]} زائد {NUM_WORDS[b]}؟"), a + b, 3, 10, r,
                       pic=[grp(e, a), op("+"), grp(e, b), op("="), vtxt("؟")], hint=Q("لنعدّ الأشياء كلها معًا")))
    subs = [(a, b) for a in range(6, 11) for b in range(1, a)]
    r.shuffle(subs)
    for a, b in subs[:6]:
        e = OBJ[r.randrange(len(OBJ))][0]
        lv.add(nchoice(Q(f"كم يساوي {NUM_WORDS[a]} ناقص {NUM_WORDS[b]}؟"), a - b, 0, 10, r,
                       pic=[grp(e, a, b), vtxt(f"{ar(a)} − {ar(b)} = ؟")], hint=Q("لنشطب الأشياء ثم نعدّ ما بقي")))
    miss = [(a, b) for a in range(1, 8) for b in range(1, 8) if a + b <= 10]
    r.shuffle(miss)
    for a, b in miss[:4]:
        lv.add(nchoice(Q(f"ما العدد الناقص: {NUM_WORDS[a]} زائد كم يساوي {NUM_WORDS[a + b]}؟"), b, 0, 10, r,
                       pic=[vtxt(f"{ar(a)} + ؟ = {ar(a + b)}")], hint=Q("كم نحتاج لنصل من الأول إلى الناتج؟")))
    return lv


def shape_opt(sh, color, speak=True):
    return O(sh=sh, c=color, s=SHAPES[sh] if speak else "")


def lvl_shapes():
    lv = Level("m", 8, "الأشكال", "🔷")
    r = rng("math", 8)
    keys = list(SHAPES)
    for sh in keys:
        others = [k for k in keys if k != sh]
        r.shuffle(others)
        col = PAL
        lv.add(choice(Q(f"أين ال{SHAPES[sh]}؟"),
                      [shape_opt(sh, PAL[r.randrange(6)])] + [shape_opt(o, PAL[r.randrange(6)]) for o in others[:2]], 0,
                      size="xl", sk=f"sh:{sh}", hint=Q("لننظر إلى حواف الشكل")))
    for sh in keys:
        others = [k for k in keys if k != sh]
        r.shuffle(others)
        lv.add(choice(Q("ما اسم هذا الشكل؟"), [O(x=SHAPES[sh], s=SHAPES[sh])] + [O(x=SHAPES[o], s=SHAPES[o]) for o in others[:2]], 0,
                      pic=[{"sh": sh, "c": PAL[r.randrange(6)]}], sk=f"sh:{sh}", hint=Q("لننظر إلى حواف الشكل")))
    things = {"circle": ["⚽", "🍪", "🌕"], "square": ["🎲", "🖼️", "🧩"], "triangle": ["🍕", "⛰️", "🧀"], "rectangle": ["🚪", "📱", "🍫"]}
    names = {"⚽": "الكرة", "🍪": "البسكويتة", "🌕": "البدر", "🎲": "النرد", "🖼️": "الإطار", "🧩": "قطعة الأحجية",
             "🍕": "البيتزا", "⛰️": "الجبل", "🧀": "الجبن", "🚪": "الباب", "📱": "الهاتف", "🍫": "الشوكولاتة"}
    for sh in ["circle", "square", "triangle", "rectangle"]:
        e = r.choice(things[sh])
        wrong = [x for k, v in things.items() if k != sh for x in v]
        r.shuffle(wrong)
        lv.add(choice(Q(f"أي شيء على شكل {SHAPES[sh]}؟"), [O(e=e, x=names[e])] + [O(e=w, x=names[w]) for w in wrong[:2]], 0,
                      sk=f"sh:{sh}", hint=Q("لنفكر: أي صورة تشبه هذا الشكل؟")))
    lv.add(sort(Q("لنضع كل شكل في مكانه"), [shape_opt("circle", "#118ab2", False), shape_opt("square", "#ef476f", False)],
                [(shape_opt(s, PAL[i % 6], False), 0 if s == "circle" else 1) for i, s in enumerate(["circle", "square", "square", "circle", "circle", "square"])]))
    lv.add(sort(Q("لنضع كل شكل في مكانه"), [shape_opt("triangle", "#06d6a0", False), shape_opt("circle", "#ffb703", False)],
                [(shape_opt(s, PAL[(i + 2) % 6], False), 0 if s == "triangle" else 1) for i, s in enumerate(["triangle", "circle", "circle", "triangle", "triangle", "circle"])]))
    for sh, k in [("triangle", 3), ("square", 4), ("rectangle", 4)]:
        lv.add(nchoice(Q(f"كم ضلعًا لل{SHAPES[sh]}؟"), k, 2, 6, r, pic=[{"sh": sh, "c": PAL[r.randrange(6)]}], hint=Q("لنعدّ الأضلاع المستقيمة")))
    for sh in ["circle", "square", "triangle"]:
        lv.add(trace(Q(f"لنتتبّع شكل {SHAPES[sh]} بإصبعنا"), None, "shape", shape=sh))
    lv.add(match(Q("لنصل كل شكل باسمه"), [(shape_opt(s, PAL[i], False), O(x=SHAPES[s], s=SHAPES[s])) for i, s in enumerate(["circle", "square", "triangle", "star"])]))
    lv.add(memory(Q("لنكتشف الأشكال المتشابهة"), [(shape_opt(s, PAL[i], True), shape_opt(s, PAL[i], True)) for i, s in enumerate(["heart", "star", "triangle"])]))
    return lv


def lvl_patterns():
    lv = Level("m", 9, "الأنماط والترتيب", "🧩")
    r = rng("math", 9)
    sets = [["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"], ["🐱", "🐶", "🐰", "🐥"], ["🍎", "🍌", "🍇", "🍓"], ["⭐", "❤️", "🌙", "☀️"]]
    forms = ["AB", "AB", "AAB", "ABC", "AB", "ABB", "ABC", "AAB"]
    for i, f in enumerate(forms * 2):
        s = sets[i % len(sets)][:]
        r.shuffle(s)
        mp = {c: s[j] for j, c in enumerate(dict.fromkeys(f))}
        pat = [mp[c] for c in f]
        seq = (pat * 4)[: len(pat) * 2 + 1 if len(pat) > 2 else 5]
        ans = seq[-1]
        shown = seq[:-1]
        wrong = [x for x in sets[i % len(sets)] if x != ans]
        r.shuffle(wrong)
        lv.add(choice(Q("ماذا يأتي بعد ذلك في النمط؟"), [O(e=ans, s="")] + [O(e=w, s="") for w in wrong[:2]], 0,
                      pic=[vemo(x) for x in shown] + [vtxt("؟")], sk="pat", hint=Q("لننظر إلى ما يتكرر في النمط")))
    for start, step in [(2, 2), (5, 5), (1, 3), (3, 3), (4, 2), (10, 2)]:
        seq = [start + step * j for j in range(4)]
        ds = [x for x in (seq[3] + step, seq[3] - step, seq[3] + 1) if 0 <= x <= 20 and x != seq[3]][:2]
        lv.add(choice(Q("ما العدد التالي في النمط؟"), [numo(seq[3])] + [numo(d) for d in ds], 0, ltr=1, size="xl",
                      pic=[vtxt(ar(x)) for x in seq[:3]] + [vtxt("؟")], hint=Q("كم يزيد كل عدد عن الذي قبله؟")))
    for _ in range(2):
        lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in sorted(r.sample(range(1, 11), 6))]))
    return lv


def lvl_teens():
    lv = Level("m", 10, "الأعداد من ١١ إلى ٢٠", "🔢")
    r = rng("math", 10)
    for n in range(11, 21):
        e, noun = OBJ[r.randrange(len(OBJ))]
        ds = near(n, 10, 20, 2, r)
        lv.add({"t": "count", "q": Q(f"كم {noun} هنا؟"), "e": E(e), "n": n, "ch": [numo(n)] + [numo(d) for d in ds], "a": 0, "sk": f"n:{n}"})
    for n in r.sample(range(11, 21), 4):
        others = [x for x in range(11, 21) if x != n]
        r.shuffle(others)
        lv.add(choice(Q(f"أين الرقم {NUM_WORDS[n]}؟"), [numo(n)] + [numo(o) for o in others[:2]], 0, size="xl", ltr=1, sk=f"n:{n}"))
    for n in range(3, 10, 2):
        lv.add(nchoice(Q(f"ما العدد: عشرة و{NUM_WORDS[n]}؟"), 10 + n, 10, 20, r, pic=[vtxt(f"{ar(10)} + {ar(n)} = ؟")], hint=Q("عشرة وبعدها نزيد")))
    for n in range(11, 20, 3):
        lv.add(nchoice(Q(f"ما العدد الذي يأتي بعد {NUM_WORDS[n]}؟"), n + 1, 10, 20, r, pic=[vtxt(ar(n)), vtxt("؟")]))
    n = 15
    others = [x for x in range(11, 21) if x != n]
    items = [(numo(n), True)] * 3 + [(numo(o), False) for o in others[:5]]
    r.shuffle(items)
    lv.add(balloons(Q(f"أين البالونات التي فيها الرقم {NUM_WORDS[n]}؟"), items, 3))
    lv.add(order(Q("لنرتّب الأرقام من الأصغر إلى الأكبر"), [numo(n) for n in sorted(r.sample(range(11, 21), 6))]))
    return lv


def build_levels():
    return [num_levels(1, "العدّ ١ - ٥", "🔢", 1, 5, 1), num_levels(2, "العدّ ٦ - ١٠", "🔟", 6, 10, 2), lvl_before_after(), lvl_compare(),
            lvl_add(), lvl_sub(), lvl_mix10(), lvl_shapes(), lvl_patterns(), lvl_teens()]


META = {"id": "m", "name": "مدينة الأرقام", "short": "الرياضيات", "icon": "١٢٣", "color": "#3b6fd4", "sky": ["#cfe5ff", "#9cc8ff"], "emoji": "🔢", "hints": HINTS}
