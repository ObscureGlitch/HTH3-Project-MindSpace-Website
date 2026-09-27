/*
 * MindSpace landing page — site configuration
 * ------------------------------------------------------------
 * This is the only file you need to edit to point the download
 * button(s) at your game build. No build step is required.
 *
 * downloadUrl  Where the "Download" buttons go.
 *              Default: the newest GitHub Release asset named MindSpace-Windows.zip.
 *              GitHub rejects files over 100 MB in the repo itself, so upload the
 *              game to a Release (Releases → Draft a new release → attach the zip).
 *              Any other absolute URL (Google Drive, itch.io, …) also works.
 *              Leave it as "" to show a disabled "Download coming soon" button.
 * fileSize     Optional. Shown next to the button, e.g. "412 MB".
 * version      Optional. Shown next to the button, e.g. "v1.0 · Hackathon build".
 * trailerUrl   Optional. Video file (mp4/webm) for the "Watch the trailer" dialog.
 *              Defaults to the generated background trailer.
 */
window.MINDSPACE_CONFIG = {
  downloadUrl: "https://github.com/ObscureGlitch/HTH3-Project-MindSpace-Website/releases/latest/download/MindSpace-Windows.zip",
  fileName: "MindSpace-Windows.zip",
  fileSize: "",
  version: "Hackathon demo build",
  trailerUrl: ""
};
