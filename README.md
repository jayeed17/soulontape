# soulontape.com

Static site — no build step. `index.html`, `styles.css`, `js/cassette.js` (3D hero, Three.js via CDN), `js/main.js`.

## Run locally
```
python3 -m http.server 8000   # then open http://localhost:8000
```
(Needs a server; opening the file directly blocks ES modules.)

## Swap in real content
- **Photos:** put images in `assets/`, edit `PHOTOS` in `js/main.js` (`cat`: wedding / portrait / music) and the `<img>` tags in `index.html` (strip + about).
- **Reel:** drop the video at `assets/reel.mp4` (H.264, ideally < 25 MB). Optional poster: `assets/reel-poster.jpg`, then update `poster=` on the `<video>`.
- **Testimonials, Instagram/TikTok links, email:** in `index.html`.

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
