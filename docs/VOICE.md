# Lamp's voice (free, no paid service)

The kids area talks with free, pre-recorded voices made with **Kokoro**, an open-source
text-to-speech model (Apache 2.0 license). The setup is based on the Chore Buddies voice kit.
Nothing costs money and no API key is used.

| Language | Kokoro voice | Speed |
|---|---|---|
| English | af_heart | 0.85 |
| French | ff_siwis | 0.85 |
| Portuguese | pf_dora | 0.85 |
| Spanish | ef_dora | 0.85 |

## How it works
- `tools/voice-phrases.mjs` collects every sentence the kids area says (stories, summaries,
  verses, questions, praise, instructions, challenges) into `tools/phrases/<lang>.txt`.
- `tools/record_voices.py <lang>` records each whole sentence with the full Kokoro model as small MP3 clips (48 kbps),
  packed into `voice/<lang>/pack-N.json` with `voice/<lang>/manifest.json`. Re-running only
  records new sentences.
- `js/voice-player.js` plays the recorded sentences. If any sentence of a text was not recorded,
  the whole text uses the device's own voice (speech stitched from single words sounded choppy).
- Grown-ups can choose "Lamp's recorded voice" or "This device's voice" in Settings → Read aloud.
- Sound only starts after a tap (iPhone and iPad require that). Every text in the kids area has
  a speaker button to hear it.

## After adding or changing sentences
```
pip install kokoro-onnx numpy lameenc
mkdir -p tools/kmodel   # download the two model files listed at the top of tools/record_voices.py into it
node tools/voice-phrases.mjs
python3 tools/record_voices.py en   # and fr, pt, es
```
