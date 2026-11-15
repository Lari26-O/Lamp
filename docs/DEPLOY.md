# Putting Lamp online

## Recommendation: Cloudflare Pages, connected to its own GitHub repository

| | Cloudflare Pages | GitHub Pages | Netlify |
|---|---|---|---|
| Price | Free | Free | Free |
| Bandwidth | **Unlimited** | about 100 GB a month (soft limit) | 100 GB a month |
| Speed worldwide | Excellent (global network) | Good | Very good |
| Address | `your-name.pages.dev` or your own domain | `user.github.io/repo` or your own domain | `your-name.netlify.app` |
| Auto-update when code changes | Yes | Yes | Yes |
| Preview links for changes | Yes | No | Yes |

Use **GitHub to keep the code** and **Cloudflare Pages to serve the website**. This costs nothing and has no traffic limit. Later you can buy a domain (about $10 a year, for example `lampbible.app`) and attach it in two clicks.

## Cloudflare Pages (about 3 minutes)
1. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the **Lamp** repository and the **main** branch.
3. Set *Framework preset* to **None**, leave *Build command* **empty**, and set *Build output directory* to **`/`**.
4. Name the project (for example `lamp-bible`) and click **Save and Deploy**. After about a minute the app is live at `https://lamp-bible.pages.dev`.
5. Every time code is pushed to `main`, the site updates by itself.

## Or GitHub Pages
In this repository go to **Settings → Pages → Deploy from a branch**, choose `main` and `/ (root)`, then click **Save**. The app appears at `https://lari26-o.github.io/Lamp/`.

## After it is online
- **Accounts**: run `docs/supabase.sql` in Supabase. In Supabase, under **Authentication → URL Configuration**, add your new address as the *Site URL*.
- **Bible versions (NKJV, NIV, NVI…)**: register the new address at platform.youversion.com and put the key in `js/config.js`.
- **Reminders**: see `docs/REMINDERS.md`.
