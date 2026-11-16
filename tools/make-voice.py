#!/usr/bin/env python3
"""Record Lamp's kids stories with a natural AI storyteller voice.

Usage:  python3 tools/make-voice.py [lang ...]      (default: en fr pt es)
Writes audio/kids/<lang>/<hash>.mp3 for every story sentence group the kids area
reads aloud, plus audio/kids/index.json (the list the app checks). Existing files
are skipped, so it can be re-run. VOICE env var picks the voice (default: shimmer).
"""
import json, os, subprocess, sys, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio', 'kids')
VOICE = os.environ.get('VOICE', 'shimmer')
LANGS = sys.argv[1:] or ['en', 'fr', 'pt', 'es']

# Every text the kids story reader can speak, per language.
JS = """
const { ALL_STORIES: STORIES, PIC_WORDS } = await import('./js/kids-data.js');
const out = {};
for (const lang of %s) {
  const L = o => (o && (o[lang] || o.en)) || '';
  const set = new Set();
  for (const s of STORIES) {
    [s.title, ...s.pages, s.summary, s.truth, s.verse?.text, s.talk, ...s.quiz.flatMap(q => [q.q, q.say])].forEach(x => { const v = L(x); if (v) set.add(v.trim()); });
  }
  Object.values(PIC_WORDS).forEach(w => set.add(L(w).trim()));
  out[lang] = [...set];
}
console.log(JSON.stringify(out));
""" % json.dumps(LANGS)


def texts():
    # kids-art.js fetches ready.json at load; give node a stub fetch and window.
    pre = "globalThis.window=globalThis;globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.fetch=async()=>({ok:false,json:async()=>({})});"
    return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', pre + JS], cwd=ROOT))


def fnv(s):
    h = 0x811c9dc5
    for b in s.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return f'{h:08x}'


def record(job):
    lang, text = job
    key = fnv(f'{lang}|{text}')
    dst = os.path.join(OUT, lang, key + '.mp3')
    if os.path.exists(dst) and os.path.getsize(dst) > 1000:
        return key
    url = 'https://gen.pollinations.ai/audio/' + urllib.parse.quote(text) + f'?voice={VOICE}&model=tts-1'
    for attempt in range(3):
        r = subprocess.run(['curl', '-sS', '-m', '120', '-o', dst, '-w', '%{http_code}', url], capture_output=True, text=True)
        if r.stdout == '200' and os.path.getsize(dst) > 1000:
            print('ok', lang, key, flush=True)
            return key
        print('  retry', lang, key, r.stdout, flush=True)
        if os.path.exists(dst):
            os.remove(dst)
        if r.stdout == '402':
            raise SystemExit('Out of credit')
        time.sleep(4 * (attempt + 1))
    return None


T = texts()
jobs = []
for lang in LANGS:
    os.makedirs(os.path.join(OUT, lang), exist_ok=True)
    jobs += [(lang, x) for x in T[lang]]
print(len(jobs), 'clips', flush=True)
try:
    with ThreadPoolExecutor(int(os.environ.get('WORKERS', '4'))) as ex:
        list(ex.map(record, jobs))
finally:
    files = sorted({f[:-4] for lang in os.listdir(OUT) if os.path.isdir(os.path.join(OUT, lang)) for f in os.listdir(os.path.join(OUT, lang)) if f.endswith('.mp3')})
    json.dump({'voice': VOICE, 'files': files}, open(os.path.join(OUT, 'index.json'), 'w'))
    print('index:', len(files), 'clips', flush=True)
