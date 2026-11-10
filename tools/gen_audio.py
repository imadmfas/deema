# -*- coding: utf-8 -*-
"""يولّد ملفات الصوت (Edge TTS) لكل نص في tools/speech_list.json. يستأنف تلقائيًا.
التشغيل:  python3 tools/gen_audio.py [عدد المهام المتوازية]
"""
import asyncio, json, os, sys
import certifi
ca = os.path.expanduser("~/.ccr/ca-bundle.crt")
if os.path.exists(ca):
    certifi.where = lambda: ca
    os.environ["SSL_CERT_FILE"] = ca
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = {"ar": "ar-IQ-RanaNeural", "en": "en-US-AnaNeural"}
RATE = {"ar": "-8%", "en": "-12%"}
PITCH = {"ar": "+2Hz", "en": "+4Hz"}


async def one(sem, it, stats):
    l, s, h = it["l"], it["s"], it["h"]
    out = os.path.join(ROOT, "audio", l, h + ".mp3")
    if os.path.exists(out) and os.path.getsize(out) > 500:
        stats["skip"] += 1
        return
    async with sem:
        for t in range(4):
            try:
                c = edge_tts.Communicate(s, VOICE[l], rate=RATE[l], pitch=PITCH[l])
                await asyncio.wait_for(c.save(out + ".tmp"), 40)
                os.replace(out + ".tmp", out)
                stats["ok"] += 1
                return
            except Exception as e:
                await asyncio.sleep(1 + t * 2)
        stats["fail"].append(it)


async def main():
    items = json.load(open(os.path.join(ROOT, "tools", "speech_list.json"), encoding="utf-8"))
    for l in VOICE:
        os.makedirs(os.path.join(ROOT, "audio", l), exist_ok=True)
    sem = asyncio.Semaphore(int(sys.argv[1]) if len(sys.argv) > 1 else 10)
    stats = {"ok": 0, "skip": 0, "fail": []}
    async def prog():
        while True:
            await asyncio.sleep(20)
            print(f"تقدم: {stats['ok']+stats['skip']}/{len(items)} فشل {len(stats['fail'])}", flush=True)
    pt = asyncio.create_task(prog())
    await asyncio.gather(*(one(sem, it, stats) for it in items))
    pt.cancel()
    print("انتهى", stats["ok"], "جديد،", stats["skip"], "موجود،", len(stats["fail"]), "فشل")
    json.dump(stats["fail"], open("/tmp/audio_fail.json", "w"), ensure_ascii=False)

asyncio.run(main())
