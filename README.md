# HTH3-Project-MindSpace-Website
The website for MindSpace, a calm, voice-first 3D wellness game built in Unity for **Hack the Hill III (Fall 2026)**.

**Live site:** https://obscureglitch.github.io/HTH3-Project-MindSpace-Website/

A single static page, hosted on GitHub Pages straight from the root of the `main` branch. There's no build step, no backend, no login and no dependencies.

```
index.html      ← the page
styles.css
main.js         ← interactions & animation (plain JS)
config.js       ← ✏️ edit this to change the download link
assets/img/     ← in-game screenshots (webp), logo, social-share image
assets/video/   ← background trailer (mp4 + webm) and its poster
.nojekyll       ← tells GitHub Pages to serve the files as-is
```

## Turn on GitHub Pages (one time)

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Choose branch **main** and folder **/ (root)**, then **Save**.
4. After a minute or two the site is live at the URL above. Every push to `main` redeploys it automatically.

## Publish the game download

GitHub won't store files over 100 MB in a repo, so the game goes in a **Release**:

1. Zip the **whole** Unity build folder (the `.exe`, `*_Data`, `MonoBleedingEdge`, `UnityPlayer.dll`, `D3D12`, …). Leave out the `*_BackUpThisFolder_ButDontShipItWithYourGame` folder.
2. Name the zip **`MindSpace-Windows.zip`**.
3. On GitHub: **Releases** → **Draft a new release** → create a tag (e.g. `v1.0`) → attach the zip → **Publish release**. (Release files can be up to 2 GB each.)

The Download buttons already point to
`https://github.com/ObscureGlitch/HTH3-Project-MindSpace-Website/releases/latest/download/MindSpace-Windows.zip`,
which always serves the newest release, so there's nothing else to change. To host it elsewhere, set `downloadUrl` in `config.js`.

## Preview locally

Open `index.html` in a browser, or run any static server from the repo root, e.g. `python -m http.server 8080`.

## Editing the "Turn through the space" tour

The tour section (`#explore` in `index.html`) stays pinned while you're in it. Each small scroll, swipe or arrow-key press moves it one stop. The giant circle and the slightly smaller, darker circle inside it both turn and fade to the next pastel, and the picture and text change. Scrolling past the last stop (or above the first) carries on down (or up) the page as normal.

Every stop has one entry in each of these lists, all in the same order:
- `.showcase__bg` → `<span class="tint-layer" style="--t:…">` (page tint)
- `data-fills="outer"` → `<span class="orb__fill" style="--f:…">` (big circle colour)
- `data-fills="inner"` → `<span class="orb__fill" style="--f:…">` (inner circle colour)
- `.orb__marks` → one `<li style="--k:N">` rim marker (spaced 72° apart for 5 stops)
- `<img data-orb-img>`, the `<button data-stop>`, and the `<article data-slide>` text

If you change the number of stops, also update `style="--stops:5"` on the section and the `72deg` in `styles.css` / `main.js` (360 ÷ number of stops).

## Replacing the trailer

The background video is a 28-second slow-pan montage made from in-engine screenshots. To use your own, replace `assets/video/trailer.mp4` **and** `trailer.webm` (or delete the webm `<source>` lines in `index.html`), and update `poster.jpg`. Keep the background version muted, short and small (≈ 3–6 MB). For a separate full trailer with sound in the "Watch the trailer" dialog, set `trailerUrl` in `config.js`.

```bash
ffmpeg -i my-trailer.mov -an -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow -movflags +faststart assets/video/trailer.mp4
ffmpeg -i assets/video/trailer.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 assets/video/trailer.webm
```

## Notes
- All paths are relative, so the site works at `…github.io/HTH3-Project-MindSpace-Website/` and on a custom domain.
- Fonts (Fraunces + Nunito Sans) load from Google Fonts, with system-font fallbacks.
- Respects `prefers-reduced-motion`: animations, parallax and the background video are switched off (the tour still steps by scrolling). The video also has a visible pause button.
- Performance: no `backdrop-filter` or blur filters, colour changes are opacity cross-fades, scroll work is batched in one `requestAnimationFrame`, looping animations pause off-screen, below-the-fold sections use `content-visibility: auto`, and fonts load without blocking the first paint.
- Crisis line info (9-8-8 in Canada/US, findahelpline.com elsewhere) is in the Care section. Keep it if you edit that section.
