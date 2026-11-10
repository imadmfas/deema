# -*- coding: utf-8 -*-
"""مرسم الألوان: ألعاب الألوان (التلوين والرسم الحر يُبنيان في الواجهة)."""
from common import *

HINTS = ["لننظر إلى الألوان بعناية", "لنتذكر ألوان الأشياء حولنا", "لنخلط الألوان في خيالنا"]
CL = {"red": ("أحمر", "#e63946"), "blue": ("أزرق", "#1d70d8"), "green": ("أخضر", "#2fb344"), "yellow": ("أصفر", "#ffd23f"),
      "orange": ("برتقالي", "#ff8c1a"), "pink": ("وردي", "#ff7eb6"), "purple": ("بنفسجي", "#8b5cf6"), "brown": ("بني", "#8d5524"),
      "white": ("أبيض", "#ffffff"), "black": ("أسود", "#222222")}


def sw(k, speak=True):
    n, h = CL[k]
    return O(c=h, s=n if speak else "")


def circ(k):
    return {"c": CL[k][1], "sh": "circle"}


def build_levels():
    lv = Level("a", 1, "ألعاب الألوان", "🎨")
    r = rng("art", 1)
    keys = list(CL)
    for k in ["red", "blue", "green", "yellow", "orange", "pink", "purple", "brown"]:
        others = [x for x in keys if x != k]
        r.shuffle(others)
        lv.add(choice(Q(f"أين اللون {CL[k][0]}؟"), [sw(k)] + [sw(o) for o in others[:2]], 0, size="xl", sk=f"col:{k}", hint=Q(HINTS[0])))
    things = [("🍌", "الموزة", "yellow"), ("🍎", "التفاحة الحمراء", "red"), ("🥬", "الخس", "green"), ("🌊", "البحر", "blue"), ("🍊", "البرتقالة", "orange"),
              ("🌸", "الوردة", "pink"), ("🍇", "العنب البنفسجي", "purple"), ("🐻", "الدب", "brown")]
    for em, nm, k in things[:6]:
        others = [x for x in keys if x != k]
        r.shuffle(others)
        lv.add(choice(Q(f"ما لون {nm}؟"), [sw(k)] + [sw(o) for o in others[:2]], 0, pic=[vemo(em)], size="xl", sk=f"col:{k}", hint=Q(HINTS[1])))
    for a, b, res in [("blue", "yellow", "green"), ("red", "yellow", "orange"), ("red", "blue", "purple"), ("red", "white", "pink")]:
        others = [x for x in keys if x != res and x not in (a, b)]
        r.shuffle(others)
        na, nb = CL[a][0], CL[b][0]
        lv.add(choice(Q(f"ماذا ينتج من خلط اللون {na} مع اللون {nb}؟"), [sw(res)] + [sw(o) for o in others[:2]], 0,
                      pic=[circ(a), op("+"), circ(b), op("="), vtxt("؟")], size="xl", ltr=1, sk="mix", hint=Q(HINTS[2])))
    for pair in [("red", "yellow"), ("green", "blue")]:
        gs = {"red": [T("تفاحة", "🍎"), T("فراولة", "🍓"), T("وردة", "🌹")], "yellow": [T("موزة", "🍌"), T("شمس", "☀️"), T("عباد الشمس", "🌻")],
              "green": [T("خس", "🥬"), T("ضفدع", "🐸"), T("شجرة", "🌳")], "blue": [T("حوت", "🐋"), T("فراشة زرقاء", "🦋"), T("قلب أزرق", "💙")]}
        items = [(x, 0) for x in gs[pair[0]]] + [(x, 1) for x in gs[pair[1]]]
        r.shuffle(items)
        lv.add(sort(Q("لنضع كل شيء مع لونه"), [sw(pair[0], False), sw(pair[1], False)], items))
    for k in ["red", "blue"]:
        others = [x for x in keys if x != k]
        items = [(sw(k, False), True)] * 3 + [(sw(o, False), False) for o in others[:5]]
        r.shuffle(items)
        lv.add(balloons(Q(f"أين البالونات {'الحمراء' if k == 'red' else 'الزرقاء'}؟"), items, 3, sk=f"col:{k}"))
    lv.add(match(Q("لنصل كل لون باسمه"), [(sw(k, False), O(x=CL[k][0], s=CL[k][0])) for k in ["red", "blue", "green", "yellow"]]))
    lv.add(memory(Q("لنكتشف اللون واسمه"), [(sw(k, False), O(x=CL[k][0], s=CL[k][0])) for k in ["pink", "purple", "orange"]]))
    return [lv]


META = {"id": "a", "name": "مرسم الألوان", "short": "الألوان", "icon": "🎨", "color": "#d6409f", "sky": ["#ffe0f3", "#ffc2e8"], "emoji": "🎨", "hints": HINTS}
