#!/usr/bin/env python3
"""Make Lamp's kids illustrations from tools/art-prompts.mjs.

Usage:  python3 tools/make-art.py [name-prefix ...]
Needs network access to the image service (key supplied by the environment/proxy).
Writes img/kids/<story>-<n>.webp, img/kids/color/<story>.png and img/kids/pics/<id>.webp.
Existing files are skipped, so it can be re-run safely; delete a file to remake it.
"""
import json, os, subprocess, sys, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'kids')
RAW = os.environ.get('RAW_DIR', os.path.join(ROOT, '.art-raw'))
MODEL = os.environ.get('MODEL', 'zimage')
for d in ('', 'pics', 'color'):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)
os.makedirs(RAW, exist_ok=True)

P = json.loads(subprocess.check_output(['node', '-e', "import('./tools/art-prompts.mjs').then(m=>console.log(JSON.stringify(m)))"], cwd=ROOT))


def fetch(name, prompt, w, h, seed):
    raw = os.path.join(RAW, name + '.jpg')
    if os.path.exists(raw) and os.path.getsize(raw) > 8000:
        return raw
    url = 'https://gen.pollinations.ai/image/' + urllib.parse.quote(prompt) + f'?width={w}&height={h}&seed={seed}&model={MODEL}&nologo=true'
    for attempt in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '240', '-o', raw, '-w', '%{http_code}', url], capture_output=True, text=True)
        if r.stdout == '200' and os.path.getsize(raw) > 8000:
            return raw
        print('  retry', name, r.stdout, r.stderr[:120], flush=True)
        if os.path.exists(raw):
            os.remove(raw)
        time.sleep(6 * (attempt + 1))
    print('FAILED', name, flush=True)
    return None


def cutout(im):
    im = im.convert('RGBA')
    bw = im.convert('L').point(lambda v: 255 if v > 238 else 0)
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        if bw.getpixel(c) == 255:
            ImageDraw.floodfill(bw, c, 128)
    mask = bw.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.GaussianBlur(1))
    im.putalpha(mask)
    box = mask.point(lambda v: 255 if v > 30 else 0).getbbox()
    if box:
        im = im.crop(box)
        side = int(max(im.size) * 1.06)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
        im = sq
    return im.resize((320, 320), Image.LANCZOS)


jobs = []
want = lambda k: len(sys.argv) < 2 or any(k.startswith(a) for a in sys.argv[1:])
for sid, pages in P['SCENES'].items():
    for i, desc in enumerate(pages):
        name = f'{sid}-{i + 1}'
        dst = os.path.join(OUT, name + '.webp')
        if want(name) and not os.path.exists(dst):
            jobs.append(('scene', name, f"{desc}. {P['STYLE']}", dst, 101 + i))
    name = f'color-{sid}'
    dst = os.path.join(OUT, 'color', sid + '.png')
    if want(name) and not os.path.exists(dst):
        jobs.append(('color', name, f"{pages[P['COLOR'][sid] - 1]}. {P['COLOR_STYLE']}", dst, 7))
for pid, desc in P['PICS'].items():
    name = f'pic-{pid}'
    dst = os.path.join(OUT, 'pics', pid + '.webp')
    if want(name) and not os.path.exists(dst):
        jobs.append(('pic', name, f"{desc}. {P['PIC_STYLE']}", dst, 21))


def run(job):
    kind, name, prompt, dst, seed = job
    w, h = (1024, 672) if kind != 'pic' else (640, 640)
    raw = fetch(name, prompt, w, h, seed)
    if not raw:
        return
    im = Image.open(raw)
    if kind == 'scene':
        im.convert('RGB').resize((960, 630), Image.LANCZOS).save(dst, quality=78, method=6)
    elif kind == 'color':
        g = im.convert('L').resize((960, 630), Image.LANCZOS).point(lambda v: 255 if v > 160 else 0).convert('1')
        g.save(dst, optimize=True)
    else:
        cutout(im).save(dst, quality=85, method=6)
    print('ok', name, flush=True)


print(len(jobs), 'pictures to make', flush=True)
with ThreadPoolExecutor(int(os.environ.get('WORKERS', '4'))) as ex:
    list(ex.map(run, jobs))
import glob
files = sorted(os.path.relpath(f, OUT) for f in glob.glob(os.path.join(OUT, '**', '*.*'), recursive=True) if not f.endswith('ready.json'))
json.dump({'files': files}, open(os.path.join(OUT, 'ready.json'), 'w'))
print('done,', len(files), 'files listed in ready.json', flush=True)
