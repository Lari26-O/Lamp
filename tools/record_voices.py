#!/usr/bin/env python3
"""Free, natural voice clips for Lamp (no paid service, no API key).

Based on the Chore Buddies voice kit. Uses Kokoro, a free open-source text-to-speech
model (Apache 2.0). Records every whole sentence ahead of time
(single words only with --words: speech stitched from words sounds choppy) as small MP3 clips packed into
voice/<lang>/pack-N.json with voice/<lang>/manifest.json. Re-run after adding
sentences: it only records what is new.

Setup (once):
  pip install kokoro-onnx numpy lameenc
  download into kmodel/ (next to this script, or set KMODEL=/path):
    https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    (or the smaller, lower-quality kokoro-v1.0.int8.onnx)
    https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Use (from the project folder):
  node tools/voice-phrases.mjs                 (writes tools/phrases/<lang>.txt)
  python3 tools/record_voices.py en            (or fr, pt, es)
"""
import argparse, base64, json, os, re, sys, unicodedata
import numpy as np, lameenc
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KMODEL = os.environ.get('KMODEL', os.path.join(ROOT, 'tools', 'kmodel'))
# Warm, kind voices: English af_heart (as in Chore Buddies), and Kokoro's voices for the others.
VOICES = {'en': ('af_heart', 'en-us'), 'fr': ('ff_siwis', 'fr-fr'), 'pt': ('pf_dora', 'pt-br'), 'es': ('ef_dora', 'es')}

def norm(s):  # the same key the web player (js/voice-player.js) uses
    s = unicodedata.normalize('NFC', s.lower().replace('’', "'").replace('‘', "'"))
    return ' '.join(''.join(c if c.isalnum() or c == "'" else ' ' for c in s).split())
def sentences(t):
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', t) if x.strip()]

ap = argparse.ArgumentParser()
ap.add_argument('lang', choices=list(VOICES))
ap.add_argument('--speed', type=float, default=0.85)
ap.add_argument('--pack-mb', type=float, default=2)
ap.add_argument('--words', action='store_true', help='also record single words (stitched speech sounds choppy, so off by default)')
a = ap.parse_args()
voice, klang = VOICES[a.lang]
out = os.path.join(ROOT, 'voice', a.lang)
os.makedirs(out, exist_ok=True)
man_path = os.path.join(out, 'manifest.json')
man = json.load(open(man_path)) if os.path.exists(man_path) else {'voice': voice, 'packs': [], 'keys': {}}
todo = {}
for line in open(os.path.join(ROOT, 'tools', 'phrases', a.lang + '.txt'), encoding='utf-8').read().splitlines():
    for s in sentences(line):
        k = norm(s)
        if k and k not in man['keys']: todo.setdefault(k, s)
        if a.words:
            for w in k.split():
                if w not in man['keys']: todo.setdefault(w, w)
print(a.lang, 'to record:', len(todo), flush=True)
if not todo: sys.exit(0)

# The full model sounds clearly better than the small int8 one; use it when it is there.
model = 'kokoro-v1.0.onnx' if os.path.exists(os.path.join(KMODEL, 'kokoro-v1.0.onnx')) else 'kokoro-v1.0.int8.onnx'
tts = Kokoro(os.path.join(KMODEL, model), os.path.join(KMODEL, 'voices-v1.0.bin'))
pack, size, limit = {}, 0, a.pack_mb * 1024 * 1024
def flush():
    global pack, size
    if not pack: return
    idx = len(man['packs']); name = f'pack-{idx + 1}.json'
    json.dump(pack, open(os.path.join(out, name), 'w'), separators=(',', ':'))
    man['packs'].append(name)
    for k in pack: man['keys'][k] = idx
    json.dump(man, open(man_path, 'w'), separators=(',', ':'), ensure_ascii=False)
    print(a.lang, 'wrote', name, len(pack), 'clips', flush=True); pack, size = {}, 0
for n, (key, s) in enumerate(todo.items(), 1):
    say = s if re.search(r'[.!?]$', s) else s + ('.' if len(s.split()) > 2 else '')
    try:
        audio, sr = tts.create(say, voice=voice, speed=a.speed, lang=klang)
    except Exception as e:
        print('skip', repr(s), e, flush=True); continue
    audio = np.asarray(audio, dtype=np.float32)
    nz = np.where(np.abs(audio) > .012)[0]  # trim silence so stitched words flow
    if len(nz): audio = audio[max(0, nz[0] - int(.03 * sr)): min(len(audio), nz[-1] + int(.06 * sr))]
    enc = lameenc.Encoder(); enc.set_bit_rate(48); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    mp3 = enc.encode((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes()) + enc.flush()
    pack[key] = base64.b64encode(mp3).decode(); size += len(pack[key])
    if size > limit: flush()
    if n % 100 == 0: print(a.lang, n, '/', len(todo), flush=True)
flush(); print(a.lang, 'done. total clips:', len(man['keys']), flush=True)
