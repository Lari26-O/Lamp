# Daily reminders

Lamp offers three kinds of reminder. The first two work with no setup at all.

1. **Calendar reminder.** In Settings → Reminders & app, tap **Add to my calendar**. This downloads a repeating daily event with an alert. It works on every iPhone, Android phone and computer.
2. **On-device reminder.** In Chrome on Android, once the app is installed, Lamp can notify you once a day after the time you choose. It uses a browser feature called *periodic background sync*, so the exact time depends on the phone.
3. **Push notifications** arrive even when the app is closed, on Android, computers and iPhone/iPad (iOS 16.4 or later, with the app added to the home screen). They need a one-time setup:

### Push setup (about 10 minutes)
1. Make the keys: on any computer with Node.js, run `npx web-push generate-vapid-keys`. This prints a public key and a private key.
2. Put the **public** key in `js/config.js` as `VAPID_PUBLIC_KEY`.
3. Run `docs/supabase.sql` in the Supabase SQL editor. It creates the `lamp_push` table.
4. Deploy the sender. Install the Supabase CLI, then run:
   ```bash
   supabase link --project-ref hiqcvokyksuwyvcgqppd
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
   supabase functions deploy send-reminders --no-verify-jwt
   ```
5. Schedule it every 15 minutes. In the SQL editor, enable the `pg_cron` and `pg_net` extensions, then run:
   ```sql
   select cron.schedule('lamp-reminders', '*/15 * * * *',
     $$ select net.http_post(url := 'https://hiqcvokyksuwyvcgqppd.supabase.co/functions/v1/send-reminders') $$);
   ```

The private key stays secret inside Supabase. Never put it in the website code.
