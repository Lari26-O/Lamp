// Supabase Edge Function: sends daily reminder notifications.
// Deploy:  supabase functions deploy send-reminders --no-verify-jwt
// Secrets: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
// Schedule it every 15 minutes (see docs/REMINDERS.md).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const MESSAGES: Record<string, { title: string; body: string }> = {
  en: { title: 'Time with God', body: 'Your Bible reading and today’s challenge are waiting.' },
  fr: { title: 'Un moment avec Dieu', body: 'Votre lecture biblique et le défi du jour vous attendent.' },
  pt: { title: 'Tempo com Deus', body: 'Sua leitura bíblica e o desafio de hoje estão esperando.' },
  es: { title: 'Tiempo con Dios', body: 'Tu lectura bíblica y el desafío de hoy te esperan.' },
};

Deno.serve(async () => {
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const now = new Date();
  const minute = now.getUTCHours() * 60 + now.getUTCMinutes();
  const from = minute - 15;
  // Rows whose reminder time falls in the last 15 minutes (handles midnight wrap).
  const q = db.from('lamp_push').select('endpoint, subscription, lang');
  const { data, error } = from >= 0 ? await q.gt('utc_minute', from).lte('utc_minute', minute)
    : await q.or(`utc_minute.gt.${from + 1440},utc_minute.lte.${minute}`);
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0;
  for (const row of data ?? []) {
    const msg = MESSAGES[row.lang] ?? MESSAGES.en;
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({ ...msg, url: '#/challenge' }));
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await db.from('lamp_push').delete().eq('endpoint', row.endpoint);
    }
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
