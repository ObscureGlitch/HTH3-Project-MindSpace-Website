/*
 * MindSpace landing page — site configuration
 * ------------------------------------------------------------
 * This is the only file you need to edit to point the download
 * button(s) at your game build. No rebuild step is required.
 *
 * downloadUrl  Where the "Download" buttons go. Either:
 *                - a file you place in /public/downloads/ (e.g. "downloads/MindSpace-Windows.zip"), or
 *                - any absolute URL (GitHub Release, Google Drive, itch.io, S3, ...).
 *              Leave it as "" to show a disabled "Download coming soon" state.
 * fileName     Optional. Suggested filename for same-origin downloads.
 * fileSize     Optional. Shown next to the button, e.g. "412 MB".
 * version      Optional. Shown next to the button, e.g. "v1.0 · Hackathon build".
 * trailerUrl   Optional. Video file (mp4/webm) for the "Watch the trailer" dialog.
 *              Defaults to the generated background trailer.
 */
window.MINDSPACE_CONFIG = {
  downloadUrl: "downloads/MindSpace-Windows.zip",
  fileName: "MindSpace-Windows.zip",
  fileSize: "",
  version: "Hackathon demo build",
  trailerUrl: ""
};
