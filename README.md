# PageScan

**Free, private, mobile-first photo-to-PDF scanner.**

## Features

- Use your phone's camera or choose existing images.
- Combine multiple pages into one downloadable PDF.
- Preview, rotate, reorder, and delete pages.
- Adjust exported image resolution to control PDF size.
- Install it as a PWA and use it offline after the first successful visit.
- Runs entirely in the browser; no uploads, login, analytics, or server.

## Mobile compatibility

- **Camera:** the Take photo control requests the rear camera on supported Android
  and iOS browsers. The separate gallery control supports selecting several pages.
- **Orientation:** browser image decoding honors camera EXIF orientation before a
  user's additional 90-degree rotations are applied.
- **Large scans:** pages are decoded and compressed one at a time, and JPEG export
  uses binary blobs instead of a base64 copy to reduce peak mobile memory use.
- **Saving:** PageScan attempts a normal download and then keeps Download PDF and
  Open PDF actions visible. Browsers that support file sharing also show a native
  Share / save action, which is useful for Files, Drive, and other mobile apps.

HEIC/HEIF support depends on the browser and operating system. If a browser cannot
decode a photo, convert or share it as JPEG/PNG and add it again. Very large page
collections can still exceed a phone's available memory; Compact mode is the safest
fallback.

## Install and offline use

`manifest.webmanifest` and `sw.js` cache only the static application shell. Open the
deployed site once while online, then install it from the browser or add it to the
home screen. Scanned photos and generated PDFs are never placed in the service
worker cache and are cleared when the page is refreshed.

Service workers require HTTPS (GitHub Pages supplies it) or localhost. Opening
`index.html` directly still runs the scanner, but install/offline caching is not
available for `file://` pages.

## Reforestation fundraiser

The optional **Support reforestation** link opens this campaign on JustGiving:

https://www.justgiving.com/page/freepagescan?utm_medium=FA&utm_source=CL

Donations are processed by JustGiving for One Tree Planted. PageScan does **not**
accept payments, collect donor information, or track successful payments itself.

**Track confirmed donations directly on the fundraiser's JustGiving dashboard.**
Click counts are *not* donation counts. PageScan currently does not run analytics.

## Deploy to GitHub Pages

1. Create a **public** repository named `pagescan`.
2. Upload the repository contents, including `index.html`, `app.js`,
   `scanner-core.js`, `manifest.webmanifest`, `sw.js`, `icon.svg`, `.nojekyll`, and
   `README.md`, to its `main` branch **root**.
3. Under **Settings → Pages → Build and deployment**, set **Deploy from a branch**.
4. Choose **main** and **/(root)**, then Save.
5. Open `https://YOUR_USERNAME.github.io/pagescan/` on your phone.

There is no build step or dependency installation. You can test the scanner by
opening `index.html` directly, or serve the folder from localhost to test the PWA.

Run the dependency-free PDF regression checks with:

```sh
node tests/core.test.js
```

## Codex handoff

Recommended release checks:

1. On Android Chrome and iOS Safari, capture a portrait page and import a landscape
   page from the gallery.
2. Rotate both pages, reorder them, and export Standard and Compact PDFs.
3. Confirm both PDF pages have the expected order and orientation, then exercise
   Download, Open, and (when shown) Share / save.
4. Install/add PageScan to the home screen, switch the device offline, relaunch it,
   and repeat a short two-page scan.
5. Confirm the JustGiving link opens the configured external campaign and that no
   referral click is presented as a confirmed donation.

Constraints: free core functionality, no login, no image uploads, static-only
GitHub Pages compatibility, no required third-party JavaScript services.
Keep the donation link optional and separate from PDF creation.

## Privacy and limitations

All images and PDF generation run on the user's device. Page data is not persisted
after refreshing. The app does not automatically detect page edges or perform OCR.
Large image collections may exhaust device memory.
