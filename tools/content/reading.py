# -*- coding: utf-8 -*-
"""وادي الحروف: ٢٨ حرفًا في ٧ مستويات + قراءة الكلمات + الحركات."""
from common import *

# (الحرف، اسمه، [(الكلمة، النطق بالتشكيل، الأيقونة)])
LETTERS = [
    ("أ", "الألف", [("أسد", "أَسَد", "🦁"), ("أرنب", "أَرْنَب", "🐰")]),
    ("ب", "الباء", [("بطة", "بَطَّة", "🦆"), ("بيت", "بَيْت", "🏠"), ("باب", "بَاب", "🚪"), ("بقرة", "بَقَرَة", "🐄")]),
    ("ت", "التاء", [("تفاحة", "تُفَّاحَة", "🍎"), ("تمساح", "تِمْسَاح", "🐊"), ("تاج", "تَاج", "👑")]),
    ("ث", "الثاء", [("ثعلب", "ثَعْلَب", "🦊"), ("ثلج", "ثَلْج", "❄️"), ("ثور", "ثَوْر", "🐂"), ("ثوم", "ثُوم", "🧄")]),
    ("ج", "الجيم", [("جمل", "جَمَل", "🐪"), ("جزرة", "جَزَرَة", "🥕"), ("جبل", "جَبَل", "⛰️"), ("جرس", "جَرَس", "🔔")]),
    ("ح", "الحاء", [("حصان", "حِصَان", "🐴"), ("حوت", "حُوت", "🐋"), ("حلزون", "حَلَزُون", "🐌"), ("حقيبة", "حَقِيبَة", "🎒")]),
    ("خ", "الخاء", [("خروف", "خَرُوف", "🐑"), ("خيمة", "خَيْمَة", "⛺"), ("خس", "خَسّ", "🥬"), ("خاتم", "خَاتَم", "💍")]),
    ("د", "الدال", [("دجاجة", "دَجَاجَة", "🐔"), ("دب", "دُبّ", "🐻"), ("دلفين", "دُلْفِين", "🐬"), ("دراجة", "دَرَّاجَة", "🚲")]),
    ("ذ", "الذال", [("ذرة", "ذُرَة", "🌽"), ("ذئب", "ذِئْب", "🐺"), ("ذباب", "ذُبَاب", "🪰")]),
    ("ر", "الراء", [("روبوت", "رُوبُوت", "🤖"), ("ريشة", "رِيشَة", "🪶"), ("رز", "رُزّ", "🍚")]),
    ("ز", "الزاي", [("زرافة", "زَرَافَة", "🦒"), ("زهرة", "زَهْرَة", "🌸"), ("زيتون", "زَيْتُون", "🫒")]),
    ("س", "السين", [("سمكة", "سَمَكَة", "🐟"), ("سيارة", "سَيَّارَة", "🚗"), ("ساعة", "سَاعَة", "⏰"), ("سلحفاة", "سُلَحْفَاة", "🐢")]),
    ("ش", "الشين", [("شمس", "شَمْس", "☀️"), ("شجرة", "شَجَرَة", "🌳"), ("شمعة", "شَمْعَة", "🕯️")]),
    ("ص", "الصاد", [("صاروخ", "صَارُوخ", "🚀"), ("صابون", "صَابُون", "🧼"), ("صقر", "صَقْر", "🦅")]),
    ("ض", "الضاد", [("ضفدع", "ضِفْدَع", "🐸"), ("ضوء", "ضَوْء", "💡")]),
    ("ط", "الطاء", [("طائرة", "طَائِرَة", "✈️"), ("طاووس", "طَاوُوس", "🦚"), ("طبل", "طَبْل", "🥁")]),
    ("ظ", "الظاء", [("ظرف", "ظَرْف", "✉️"), ("ظفر", "ظُفْر", "💅")]),
    ("ع", "العين", [("عنب", "عِنَب", "🍇"), ("عصفور", "عُصْفُور", "🐦"), ("عسل", "عَسَل", "🍯"), ("عين", "عَيْن", "👁️")]),
    ("غ", "الغين", [("غيمة", "غَيْمَة", "☁️"), ("غزال", "غَزَال", "🦌")]),
    ("ف", "الفاء", [("فيل", "فِيل", "🐘"), ("فراشة", "فَرَاشَة", "🦋"), ("فراولة", "فَرَاوِلَة", "🍓")]),
    ("ق", "القاف", [("قمر", "قَمَر", "🌙"), ("قطة", "قِطَّة", "🐱"), ("قلم", "قَلَم", "✏️"), ("قرد", "قِرْد", "🐒")]),
    ("ك", "الكاف", [("كتاب", "كِتَاب", "📖"), ("كرة", "كُرَة", "⚽"), ("كلب", "كَلْب", "🐶"), ("كرسي", "كُرْسِيّ", "🪑")]),
    ("ل", "اللام", [("ليمون", "لَيْمُون", "🍋"), ("لعبة", "لُعْبَة", "🧸"), ("لسان", "لِسَان", "👅")]),
    ("م", "الميم", [("موز", "مَوْز", "🍌"), ("مفتاح", "مِفْتَاح", "🔑"), ("مدرسة", "مَدْرَسَة", "🏫"), ("مطر", "مَطَر", "🌧️")]),
    ("ن", "النون", [("نحلة", "نَحْلَة", "🐝"), ("نجمة", "نَجْمَة", "⭐"), ("نمر", "نَمِر", "🐅"), ("نخلة", "نَخْلَة", "🌴")]),
    ("ه", "الهاء", [("هدية", "هَدِيَّة", "🎁"), ("هاتف", "هَاتِف", "📱")]),
    ("و", "الواو", [("وردة", "وَرْدَة", "🌹"), ("ولد", "وَلَد", "👦")]),
    ("ي", "الياء", [("يد", "يَد", "✋"), ("ياسمين", "يَاسَمِين", "🌼"), ("يمامة", "يَمَامَة", "🕊️")]),
]
GROUPS = [LETTERS[i:i + 4] for i in range(0, 28, 4)]
NAME = {g: n for g, n, _ in LETTERS}
NAME["ة"] = "التاء المربوطة"
HARAKAT = [("َ", "فتحة"), ("ُ", "ضمة"), ("ِ", "كسرة")]
HINTS = ["لننطق الكلمة ببطء ونركّز على أول صوت فيها", "لنستمع جيدًا إلى اسم الحرف", "لننظر إلى شكل الحرف جيدًا"]


def lopt(g):
    return O(x=g, s=NAME[g], sk=f"ar:{g}")


def wopt(w, pic=True, text=True):
    word, sp, em = w
    return O(x=word if text else None, e=em if pic else None, s=sp)


def can_build(word, learned, lvl):
    letters = list(word)
    for ch in letters:
        if ch == "ة":
            if lvl < 2:
                return False
        elif ch not in learned:
            return False
    return 2 <= len(letters) <= 4


def level_letters(lvl_idx):
    g = GROUPS[lvl_idx - 1]
    learned = [x[0] for grp in GROUPS[:lvl_idx] for x in grp]
    return g, learned


def build_levels():
    levels = []
    allwords = [(g, w) for g, _, ws in LETTERS for w in ws]
    for li in range(1, 8):
        grp, learned = level_letters(li)
        glyphs = [x[0] for x in grp]
        first = grp[0][2][0]
        lv = Level("r", li, " ".join(glyphs), first[2])
        r = rng("reading", li)
        learned_words = [(g, w) for g, w in allwords if g in learned]
        for g, name, words in grp:
            sk = f"ar:{g}"
            others = [x for x in learned if x != g]
            # 1) أين حرف؟
            r.shuffle(others)
            lv.add(choice(Q(f"أين حرف {name[2:]}؟"), [lopt(g)] + [lopt(o) for o in others[:2]], 0, sk=sk, size="xl", hint=Q("لننظر إلى شكل الحرف جيدًا")))
            # 2) أي صورة تبدأ بحرف؟
            w = words[0]
            wrong = [(gg, ww) for gg, ww in learned_words if gg != g]
            r.shuffle(wrong)
            pics = [wopt(w)] + [wopt(ww) for _, ww in wrong[:2]]
            lv.add(choice(Q(f"أي صورة تبدأ بحرف {name[2:]}؟"), pics, 0, sk=sk, hint=Q(HINTS[0])))
            # 3) ما الحرف الأول؟
            w2 = words[-1]
            r.shuffle(others)
            lv.add(choice(Q(f"ما الحرف الأول في كلمة {w2[0]}؟", f"ما الحرف الأول في كلمة {w2[1]}؟"),
                          [lopt(g)] + [lopt(o) for o in others[:2]], 0,
                          pic=[vemo(w2[2]), vtxt(w2[0])], sk=sk, size="xl", hint=Q(HINTS[0])))
            # 4) تتبّع
            lv.add(trace(Q(f"لنتتبّع حرف {name[2:]} بإصبعنا"), g, "ar", sk=sk))
        # أنشطة المستوى
        for g, name, words in grp[:2]:
            others = [x for x in learned if x != g]
            r.shuffle(others)
            items = [(lopt(g), True) for _ in range(3)] + [(lopt(o), False) for o in (others * 2)[:5]]
            r.shuffle(items)
            lv.add(balloons(Q(f"أين البالونات التي فيها حرف {name[2:]}؟"), items, 3, sk=f"ar:{g}"))
        pairs = [(lopt(g), wopt(ws[0], text=False)) for g, _, ws in grp]
        lv.add(match(Q("لنصل كل حرف بالصورة التي تبدأ به"), pairs))
        mp = [(lopt(g), wopt(ws[0], text=False)) for g, _, ws in grp[:3]]
        lv.add(memory(Q("لنكتشف الحرف وصورته"), mp))
        bw = [(g, w) for g, w in learned_words if can_build(w[0], learned, li)]
        r.shuffle(bw)
        for g, w in bw[:3]:
            letters = [ch for ch in w[0]]
            dis = [x for x in learned if x not in letters]
            r.shuffle(dis)
            tiles = [O(x=ch, s=NAME[ch]) for ch in letters] + [O(x=d, s=NAME[d]) for d in dis[:2]]
            lv.add(build(Q(f"لنرتّب الحروف لنكوّن كلمة {w[0]}", f"لنرتّب الحروف لنكوّن كلمة {w[1]}"),
                         O(x=w[0], e=w[2], s=w[1]), tiles, "rtl", sk=f"ar:{g}"))
        levels.append(lv)

    # ---- مستوى ٨: قراءة الكلمات ----
    lv = Level("r", 8, "قراءة الكلمات", "📖")
    simple = [w for _, _, ws in LETTERS for w in ws if 2 <= len(w[0]) <= 5]
    r = rng("reading", 8)
    r.shuffle(simple)
    for w in simple[:6]:
        wrong = [x for x in simple if x[2] != w[2]]
        r.shuffle(wrong)
        lv.add(choice(Q("أي صورة تدل على هذه الكلمة؟"), [wopt(w, text=False)] + [wopt(x, text=False) for x in wrong[:2]], 0,
                      pic=[vtxt(w[0])], hint=Q("لنقرأ الحروف واحدًا واحدًا")))
    for w in simple[6:12]:
        wrong = [x for x in simple if x[2] != w[2] and x[0][0] != w[0][0]]
        r.shuffle(wrong)
        lv.add(choice(Q("ما هذه الكلمة؟"), [O(x=w[0], s=w[1])] + [O(x=x[0], s=x[1]) for x in wrong[:2]], 0,
                      pic=[vemo(w[2])], hint=Q("لننطق اسم الصورة ثم نبحث عن أول حرف")))
    for w in simple[12:18]:
        wrong = [x for x in simple if x[0][0] != w[0][0]]
        r.shuffle(wrong)
        lv.add(choice(Q(f"أين كلمة {w[0]}؟", f"أين كلمة {w[1]}؟"), [O(x=w[0], s=w[1])] + [O(x=x[0], s=x[1]) for x in wrong[:2]], 0,
                      listen=True, hint=Q("لنستمع مرة أخرى وننظر إلى أول حرف")))
    for w in simple[18:24]:
        word = w[0]
        i = len(word) - 1 if len(word) > 2 else 0
        missing = word[i]
        masked = word[:i] + "＿" + word[i + 1:]
        pool = [x for x in "أبتجحدرسمنلكقفعو" if x != missing]
        r.shuffle(pool)
        lv.add(choice(Q(f"ما الحرف الناقص في كلمة {word}؟", f"ما الحرف الناقص في كلمة {w[1]}؟"),
                      [lopt(missing) if missing in NAME else O(x=missing, s="")] + [lopt(p) for p in pool[:2]], 0,
                      pic=[vemo(w[2]), vtxt(masked)], size="xl", hint=Q("لننطق الكلمة ونفكر في الصوت الناقص")))
    mp = simple[24:28]
    lv.add(match(Q("لنصل كل كلمة بصورتها"), [(O(x=w[0], s=w[1]), wopt(w, text=False)) for w in mp]))
    lv.add(memory(Q("لنكتشف الكلمة وصورتها"), [(O(x=w[0], s=w[1]), wopt(w, text=False)) for w in simple[28:31]]))
    levels.append(lv)

    # ---- مستوى ٩: الحركات ----
    lv = Level("r", 9, "الحركات", "✨")
    r = rng("reading", 9)
    base = list("بتثجحخدرسمنلكفق")
    r.shuffle(base)
    names = {"َ": "فتحة", "ُ": "ضمة", "ِ": "كسرة"}
    for g in base[:12]:
        hk = HARAKAT[r.randrange(3)][0]
        syl = [O(x=g + h, s=g + h, sk=f"hk:{g}") for h, _ in HARAKAT]
        ans = [h for h, _ in HARAKAT].index(hk)
        lv.add(choice(Q("أين المقطع الذي سمعته؟", g + hk), syl, ans, listen=True, size="xl", sk=f"hk:{g}",
                      hint=Q("لنستمع إلى صوت الحرف: هل هو مفتوح أم مضموم أم مكسور؟")))
    for g in base[:2]:
        hk = HARAKAT[r.randrange(3)][0]
        items = [(O(x=g + hk, s=g + hk), True) for _ in range(3)]
        for h, _ in HARAKAT:
            if h != hk:
                items += [(O(x=g + h, s=g + h), False)] * 2
        r.shuffle(items)
        lv.add(balloons(Q("أين البالونات التي سمعتها؟", g + hk), items, 3))
    levels.append(lv)
    return levels


META = {"id": "r", "name": "وادي الحروف", "short": "قراءتي", "icon": "أ", "color": "#e0457b", "sky": ["#ffd6e7", "#ffb3d1"], "emoji": "🔤", "hints": HINTS}
