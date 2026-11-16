# Connecting Lamp with Weeklan and Softland

Lamp, Weeklan and Softland can share information when they are published on the same address, for example all under `https://<user>.github.io/`. Browsers give every page on one address the same `localStorage`, so the apps can read each other's keys.

Lamp already does its half of the work in `js/connect.js`. A sister app only needs to read the keys below.

## What Lamp publishes

### 1. A summary of the user's progress

Key: `lari:shared:lamp`. Lamp rewrites it on every screen change.

```json
{
  "app": "lamp", "version": 1, "updated": "2026-11-15T20:00:00.000Z",
  "streak": 4, "xp": 320, "xpToday": 15, "dailyGoal": 20,
  "lastRead": { "b": 42, "c": 3 }, "reviewsDue": 2, "readToday": true
}
```

Softland could use this to say "You've read 4 days in a row" or "2 memory verses are ready".

### 2. Inboxes, for requests to another app

Key: `lari:inbox:<app>`, for example `lari:inbox:weeklan`. It holds a list of items.

```json
[{ "id": "m3k2x", "from": "lamp", "created": "2026-11-15T20:00:00.000Z",
   "type": "task", "title": "Read John 4", "date": "2026-11-16", "minutes": 15,
   "link": "https://<user>.github.io/Lamp/#/read/42/4" }]
```

In Settings → Connected apps, the button "Add tomorrow's reading to Weeklan" adds one of these items.

### 3. Live updates

Lamp also posts a message on `BroadcastChannel('lari-suite')`, either `{ type: 'summary' | 'inbox', from: 'lamp', ... }`. This lets any open tab update immediately.

## What to add to Weeklan (about 15 lines)

```js
// Pick up items that Lamp (or any sister app) sent to Weeklan.
function importSuiteInbox() {
  const key = 'lari:inbox:weeklan';
  let items = [];
  try { items = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
  if (!items.length) return;
  for (const it of items) {
    if (it.type === 'task') {
      // Call Weeklan's own "add task" logic here, e.g.:
      // addTask({ title: it.title, date: it.date, minutes: it.minutes, note: it.link });
    }
  }
  localStorage.removeItem(key); // mark the items as handled
}
importSuiteInbox();
try { new BroadcastChannel('lari-suite').onmessage = e => { if (e.data?.to === 'weeklan') importSuiteInbox(); }; } catch {}
```

Weeklan can also publish `lari:shared:weeklan` (for example `{ app: 'weeklan', todayTasks: 3 }`). Lamp's settings will then show Weeklan as "Found".

## What to add to Softland

```js
const lamp = JSON.parse(localStorage.getItem('lari:shared:lamp') || 'null');
if (lamp) showCard(`Bible streak: ${lamp.streak} days · ${lamp.reviewsDue} verses to review`);
// Publish yourself so Lamp can detect Softland:
localStorage.setItem('lari:shared:softland', JSON.stringify({ app: 'softland', updated: new Date().toISOString() }));
```

## When the apps live on different addresses

`localStorage` is not shared across different addresses. In that case, use links instead. Lamp's addresses are stable:

- `…/lamp/#/read/<book 0-65>/<chapter>`: open a chapter
- `…/lamp/#/memory/review`: start today's memory review
- `…/lamp/#/learn`: the learning path

A later step could be a shared account (Weeklan already uses Supabase) so that progress syncs across devices.
