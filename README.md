# Lamp: learn and remember the Bible

> "Thy word is a lamp unto my feet, and a light unto my path." (Psalm 119:105)

Lamp is a free web app for reading, studying and remembering the Bible. It works in **English, Français, Português and Español**.

It is a plain static website: there's no server, no build step and no account. You can host it free on GitHub Pages, it works offline, and people can install it on a phone like an app. The AI helper is free and doesn't use Claude or any paid service.

## Features

### Accounts, age groups and sync
- **First-launch welcome**: the app asks for your language, name, age group, goals and daily time. Six age groups: Kids 6–9, Preteens 10–12, Teens 13–17, Young adults 18–25, Adults 26–59, Seniors 60+.
- **Age changes the app**: lesson length and difficulty (kids get 3 answer choices and shorter sections), the first book suggested, recommended plans, the "questions people your age ask", the AI's tone, and an easier-to-read font for kids and larger text for seniors.
- **Optional account with sync** (email and password) through **Supabase**. It uses the same Supabase project as Weeklan, so one account works in both apps. Notes, highlights, plans, progress and your profile sync across devices. Everything also works without an account.

### Reading plans, YouVersion-style
- **Book plans**: John (21 days), Mark, Acts, Genesis, Romans, Psalms in 30 days, Proverbs in 31 days.
- **Whole-Bible plans**: the four Gospels in 40 days, the New Testament in 90 days, the Bible in a year.
- **Topical plans**: anxiety, hope, prayer, identity, purpose. **Kids and family plans**: Heroes of the Bible, Meet Jesus.
- Each day has the readings with check-offs, a reflection question with a journal, "talk about it with AI" and "add to Weeklan". If you fall behind, you can reset the schedule to today.
- **Verse images**: turn any verse into an image to download or share. **Prayer list**: requests, a "pray now" mode, and answered prayers.

### Learn a book, section by section
- Pick any book. The path splits it into short sections (for example 3 John 1–3, 4–7, 8–10, 11–14), grouped by chapter, with a review at the end of each chapter.
- Each lesson shows the passage first, then asks questions built from that exact text: fill the missing word, "does it really say this?", put the verses in order, who is named, which verse says this, build a verse, and match verses. It works in every language and version.
- **The big story** track (Creation to the early church) is still there as a second tab. "How to study" is now its own section.

### Quizzes
- **Daily quiz** (5 questions, once a day).
- **Bible trivia**: 36 questions in three levels, in all four languages.
- **Quiz on any book**: questions taken from the book's text.
- **60-second speed round**, plus topic quizzes on people, places, the timeline, books and your memory verses.

### Read: your own study Bible
- **Highlight and underline any word or phrase.** Select the text and pick one of 5 colours, or underline it. You can also highlight whole verses.
- **Notes on words and phrases.** Select a word, choose "Note", and write what it means to you. A small pen icon then marks that word in the text. Tags work too.
- **A notes panel on the right side** (a bottom drawer on phones). It has four tabs:
  - **Notes:** all your notes, highlights and a chapter journal, in verse order. You can edit them right there.
  - **Study:** guided study, "Hard to understand?", the AI study methods and the chapter quiz.
  - **Context:** places mentioned in the chapter (linked to the map), timeline events, and book background.
  - **Videos.**
- **Compare versions side by side.**
- Read aloud with verse highlighting, word study, phrase explanation, copy and memorize.

### Bible versions
| | Built in, offline | Free online | Popular, via YouVersion¹ |
|---|---|---|---|
| English | KJV, BSB | WEB, BBE, ASV | **NKJV**, NIV, ESV, NLT, CSB, NASB, AMP |
| Français | Darby 1885, Martin 1744 | — | LSG, **Segond 21**, Semeur, NEG79, PDV |
| Português | Bíblia Livre, NVA | Almeida | **NVI**, ARA, ARC, NVT, NAA, NTLH |
| Español | Reina-Valera 1909, 1865 | — | **RVR1960**, NVI, NTV, LBLA, RVC |

¹ NKJV, NIV, NVI, RVR1960 and the other popular versions are copyrighted, so nobody may bundle them. Lamp shows them legally through **YouVersion Platform**, which gives free API access for Bible apps. To turn them on:

1. Create a free account at **platform.youversion.com** and register the site as an app.
2. Accept the license of each version you want to show.
3. Paste the App Key into `js/config.js`. App keys aren't secret, so this is safe. Users can also paste their own key in Settings.

Without a key, the 8 built-in Bibles and the free online ones still work.

### Learn: a Duolingo-style path
- **10 units:** "How to study the Bible", then the story from Creation to the early church.
- **5 lessons per unit**, including a unit review that earns a crown. Exercise types: multiple choice, true/false, putting events in order, matching people to their stories, filling in the key verse, and building the verse from word tiles. There are also short teaching cards.
- **XP, levels, a daily goal you choose, streaks, and 13 achievements.** There are no hearts to lose: a wrong answer simply comes back at the end of the lesson.

### Memorize: Versify-style games
- **8 games per verse**, each hiding a bit more of the text: Read, Listen (phrase by phrase), Fill the blanks, Build (word tiles), First letters, Type, Speak (speech recognition), and Test (90% or more to master the verse).
- **Explore:** 10 collections, such as Peace & anxiety, God's love, Strength, The gospel and Identity.
- **Spaced-repetition daily review**, like Anki.

### How to study
- **"When Scripture is hard."** This is your pastor's method from his teaching on 2 John:
  1. Notice repeated words.
  2. Take a deep breath (with a breathing guide).
  3. Invite God into the wrestle.
  4. Trust in God's goodness.
  5. Look at the biblical context, from local to global.
  6. Look at the historic context.
  7. Interpret the unclear through the clear.

  It comes with the worked 2 John example.
- **Other proven methods:** Inductive study (Hendricks), S.O.A.P. (Cordeiro), the Swedish method, Discovery Bible Study, Lectio Divina, and "Then & now" (Fee & Stuart).
- **Guided wizard.** It walks you through any method on any passage. Tools include a repeated-word finder (on 2 John 1 it finds *truth 5×, love 4×*), anchor verses about God's character, context links and AI helpers. Your answers are saved as studies.

### Explore
- **Maps:** 64 places and 7 journeys.
- **Timeline:** 72 events in 10 eras.
- **People:** 46 key people.
- **Videos:** YouTube searches in your language (BibleProject, sermons, kids, sign language), plus your own saved videos.
- **Ask AI:** a chat helper.
- **Search:** full-text search in any language.

### Accessible and clean
- Themes: light, dark, sepia and high contrast.
- Fonts include Atkinson Hyperlegible and Lexend (good for dyslexia). Text size and line spacing can be changed.
- Read aloud, reduced motion, and full support for keyboards and screen readers.
- SVG icons only, no emojis.

## The free AI: three options

Users pick one in Settings → AI.

1. **Free online AI (default).** Pollinations.ai, with no signup.
2. **On-device AI.** WebLLM runs an open model (Qwen or Llama) in the browser. It's private and works offline.
3. **Your own free key.** Groq, OpenRouter, Gemini or Ollama.

The AI always answers in the user's language.

## Turn on accounts (one-time)
1. Open your Supabase project (the same one Weeklan uses), go to **SQL Editor**, paste **`docs/supabase.sql`** and click **Run**. This creates a private `lamp_data` table with row-level security, so each person can only reach their own data. It doesn't change Weeklan's tables.
2. That's it: `js/config.js` already points to the project. If email confirmation is on in Supabase, new users must confirm their email before they can sign in.

## Put it online (free)

See **[docs/DEPLOY.md](docs/DEPLOY.md)**. In short: connect this repository to Cloudflare Pages (no build command, output directory `/`), or turn on GitHub Pages for `main` and `/ (root)`.

## Connecting Weeklan and Softland

Lamp already publishes a progress summary and an inbox in shared storage. See **[docs/CONNECT.md](docs/CONNECT.md)** for the small snippet each app needs.

## Run locally

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

## Project layout

```
./
  index.html  manifest.webmanifest  sw.js       shell, install, offline
  css/styles.css                                 design system & themes
  js/app.js                                      router, navigation, language switcher
  js/i18n.js  js/i18n/{fr,pt,es}.js              interface translations
  js/data/l10n.js                                translated places, events, people
  js/bible.js  js/config.js                      versions (local / bible-api / YouVersion), references
  js/learn-data.js  js/views/learn.js            learning path
  js/views/memory.js  js/srs.js                  memory games + spaced repetition
  js/views/reader.js                             study Bible
  js/views/study.js                              study methods & guided wizard
  js/connect.js                                  Weeklan / Softland bridge
  data/<version>/0-65.json                       bundled Bible text, one file per book
```

## Credits and licenses

- **Bible texts:**
  - KJV: public domain.
  - BSB: CC0.
  - Darby, Martin, Reina-Valera 1909/1865: public domain.
  - Bíblia Livre: CC BY 3.0 BR.
  - NVA: CC BY-SA 4.0.

  These texts come from the scrollmapper/bible_databases project. Other versions come from bible-api.com and YouVersion Platform.
- **Maps:** Leaflet (BSD-2) and © OpenStreetMap.
- **On-device AI:** WebLLM.
- Dates and locations are approximate. AI answers can be wrong, so always check them against Scripture.
