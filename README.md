# HTH3-Project-MindSpace-Website
The website for MindSpace — a calm, voice-first 3D wellness game built in Unity for **Hack the Hill III (Fall 2026)**.

A single static landing page: a looping background trailer, what the game is, how voice conversations work, features, gallery, controls, care/privacy notes and a download button. No login, no backend, no build step.

```
public/                 ← web root (everything that gets served)
  index.html
  styles.css
  main.js               ← small progressive enhancements, no dependencies
  config.js             ← ✏️  edit this to set the download link
  assets/img/           ← in-game screenshots (webp), logo, social card
  assets/video/         ← generated background trailer (mp4 + webm) + poster
  downloads/            ← drop your zipped game build here
Dockerfile              ← nginx:alpine image serving /public
nginx.conf
docker-compose.yml
package.json            ← convenience scripts (local preview + docker)
```

## 1. Add your game build

1. Zip the **whole** Unity build folder (the `.exe`, `*_Data`, `MonoBleedingEdge`, `UnityPlayer.dll`, `D3D12`, …) — do **not** include the `*_BackUpThisFolder_ButDontShipItWithYourGame` folder.
2. Save it as `public/downloads/MindSpace-Windows.zip`.
3. Open `public/config.js` and check `downloadUrl` matches (optionally fill in `fileSize`).

Hosting the file somewhere else (GitHub Releases, Google Drive, itch.io, S3…)? Just set `downloadUrl` to that full URL.
Setting `downloadUrl: ""` shows a disabled "Download coming soon" button.

## 2. Preview locally

```bash
npm run dev          # http://localhost:5173  (uses `npx serve`, nothing to install)
```
Or open `public/index.html` directly in a browser.

## 3. Deploy with Docker

```bash
docker compose up -d --build     # http://localhost:8080
# or
docker build -t mindspace-web .
docker run -d -p 8080:80 -v "$(pwd)/public/downloads:/usr/share/nginx/html/downloads:ro" mindspace-web
```
`public/downloads` is mounted as a volume, so you can replace the game zip without rebuilding the image.
Put a TLS-terminating reverse proxy (Caddy, Traefik, nginx) in front for HTTPS.

## Replacing the trailer

The background video is a 28-second slow-pan montage generated from in-engine screenshots.
To use your own trailer, replace `public/assets/video/trailer.mp4` **and** `trailer.webm` (or delete the webm `<source>` lines in `index.html`), and update `poster.jpg`.
Keep the background version muted, short and small (≈ 3–6 MB). For a separate full trailer with audio in the "Watch the trailer" dialog, set `trailerUrl` in `config.js`.

Example re-encode with ffmpeg:
```bash
ffmpeg -i my-trailer.mov -an -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart public/assets/video/trailer.mp4
ffmpeg -i public/assets/video/trailer.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 public/assets/video/trailer.webm
```

## Editing the "Turn through the space" tour

The tour section (`#explore` in `index.html`) stays pinned while you're in it. Each small scroll, swipe or arrow-key press moves it one stop. The giant circle and the slightly smaller, darker circle inside it both turn and fade to the next pastel, and the picture and text change. Scrolling past the last stop (or above the first) carries on down (or up) the page as normal.

Every stop has one entry in each of these lists, all in the same order:
- `.showcase__bg` → `<span class="tint-layer" style="--t:…">` (page tint)
- `data-fills="outer"` → `<span class="orb__fill" style="--f:…">` (big circle colour)
- `data-fills="inner"` → `<span class="orb__fill" style="--f:…">` (inner circle colour)
- `.orb__marks` → one `<li style="--k:N">` rim marker (spaced 72° apart for 5 stops)
- `<img data-orb-img>`, the `<button data-stop>`, and the `<article data-slide>` text

If you change the number of stops, also update `style="--stops:5"` on the section and the `72deg` in `styles.css` / `main.js` (360 ÷ number of stops).

## Notes
- Fonts (Fraunces + Nunito Sans) load from Google Fonts, with system-font fallbacks.
- Respects `prefers-reduced-motion`: animations, parallax and the background video are switched off (the tour still steps by scrolling); the video also has a visible pause button.
- Performance: no `backdrop-filter` or blur filters, colour changes are opacity cross-fades, scroll work is batched in one `requestAnimationFrame`, looping animations pause off-screen, below-the-fold sections use `content-visibility: auto`, and fonts load without blocking the first paint.
- Crisis line info (9-8-8 in Canada/US, findahelpline.com elsewhere) is in the Care section — keep it if you edit that section.
