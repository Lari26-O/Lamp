// Site-wide settings for whoever hosts Lamp.
//
// YouVersion Platform (free) unlocks popular copyrighted translations such as
// NKJV, NIV, ESV, NLT, NVI, ARA, RVR1960, NTV, Segond 21, Semeur…
//   1. Create a free account at https://platform.youversion.com
//   2. Register this website as an app and copy its App Key
//   3. Accept the license for each Bible version you want to offer
//   4. Paste the key below and publish.
// App keys are public identifiers (not secrets), so it is fine to keep it here.
// Users can also paste their own key in Settings → Bible versions.
export const YOUVERSION_APP_KEY = '';

// Shared storage prefix used to talk to sister apps (Weeklan, Softland) when
// they are hosted on the same domain (e.g. <user>.github.io). See js/connect.js.
export const SUITE_PREFIX = 'lari:';

// Accounts & sync (Supabase): Lamp's own Supabase project.
// so one account works in both apps. Lamp stores its data in its own table,
// "lamp_data" — run docs/supabase.sql once in the Supabase SQL editor to create it.
// The anon key is a public key (every Supabase website ships it);
// row-level security keeps each person's data private.
export const SUPABASE_URL = 'https://iyvsntvcazrhtbwimaad.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dnNudHZjYXpyaHRid2ltYWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3ODcwNDksImV4cCI6MjExMDM2MzA0OX0.fNv03xcGJCDf_8qqPuvtK7XUBxjhS0wSicYaaqIz5fA';

// Push reminders (optional). Generate a key pair once with:  npx web-push generate-vapid-keys
// Put the PUBLIC key here and the PRIVATE key in Supabase (see docs/REMINDERS.md).
// Leave empty to use calendar and on-device reminders only.
export const VAPID_PUBLIC_KEY = '';
