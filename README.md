# soulontape.com

Static site — no build step. `index.html`, `styles.css`, `js/cassette.js` (3D hero, Three.js via CDN), `js/main.js`.

## Run locally
```
python3 -m http.server 8000   # then open http://localhost:8000
```
(Needs a server; opening the file directly blocks ES modules.)

## Swap in real content
- **Projects:** put each shoot's photos in `assets/work/<project>/` and edit the `PROJECTS` list at the top of `js/main.js` (title, type wedding/portrait/music, place, year, `featured: true` to show in "Greatest hits", photo paths). First photo = cover. Aim for 6–10 projects × 4–6 photos, resized to ~2000px wide JPG/WebP.
- **Reel:** `assets/reel.mp4` (H.264, < 25 MB). Until it exists the reel shows "Reel coming soon". Add `assets/reel-poster.jpg` and update `poster=` on the `<video>`.
- **About photo, quotes, links, email:** in `index.html`. `CONTACT_EMAIL` is at the top of `js/main.js`.
- **Share image:** `assets/og.jpg` (1200×630). Replace with a real shot.

## Tests
`tests/run.py` (Playwright) checks every feature at 5 screen sizes, twice.

## Contact form (Supabase)
1. Create a project at supabase.com → SQL Editor → run `supabase.sql`.
2. Project Settings → API → copy the URL + anon/publishable key into the top of `js/main.js`.
3. Messages show up in Table Editor → `contact_messages`.
Until the keys are filled in, the form opens the visitor's email app instead.

## Deploy (GitHub Pages + Porkbun)
1. Push this folder to a repo → Settings → Pages → Deploy from branch `main` / root.
2. `CNAME` already contains `soulontape.com`.
3. Porkbun DNS: four `A` records on `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153, and `CNAME` `www` → `<github-username>.github.io`.
4. Back in Pages settings, tick **Enforce HTTPS** once the cert is issued.
