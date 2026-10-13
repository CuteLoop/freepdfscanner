# PDF3000

**Every PDF tool you need. Free, private, and simple.**

PDF3000 is being developed as an on-device document toolkit with no accounts,
watermarks, document uploads, or subscriptions. The photo-to-PDF scanner is the
first implemented tool; the broader editor is planned in [ROADMAP.md](ROADMAP.md).

## Available now: Scan & Create

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
- **Saving:** PDF3000 attempts a normal download and then keeps Download PDF and
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

Donations are processed by JustGiving for One Tree Planted. PDF3000 does **not**
accept payments, collect donor information, or track successful payments itself.

**Track confirmed donations directly on the fundraiser's JustGiving dashboard.**
Click counts are *not* donation counts. PDF3000 currently does not run analytics.

## Deploy to GitHub Pages

1. Create a **public** repository (this checkout is configured for
   `CuteLoop/freepdfscanner`).
2. Push this repository to its `main` branch. The workflow at
   `.github/workflows/deploy.yml` tests the PDF generator, packages only the static
   application files, and deploys them automatically on every push to `main`.
3. Under **Settings → Pages → Build and deployment**, set **Source** to
   **GitHub Actions**. You only need to do this once.
4. Open the repository's **Actions** tab and wait for **Deploy PDF3000 to GitHub
   Pages** to finish successfully. The workflow can also be run manually with its
   **Run workflow** button.
5. Open `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/` on your phone. For this
   repository, that is `https://cuteloop.github.io/freepdfscanner/`.

For production deployment, protect the `main` branch, restrict the `github-pages`
environment to the default branch, require two-factor authentication for repository
maintainers, and keep GitHub Actions limited to GitHub-authored actions. The workflow
uses least-privilege job permissions and pins every action to an immutable commit.
Pull requests run the validation/build job but cannot run the privileged deployment
job; only a `main` push or authorized manual run can publish.
See [SECURITY.md](SECURITY.md) for the deployment threat model and private reporting
instructions.

There is no build step or dependency installation. You can test the scanner by
opening `index.html` directly, or serve the folder from localhost to test the PWA.

Run the dependency-free PDF regression checks with:

```sh
node tests/core.test.js
node tests/security.test.js
```

## Codex handoff

Recommended release checks:

1. On Android Chrome and iOS Safari, capture a portrait page and import a landscape
   page from the gallery.
2. Rotate both pages, reorder them, and export Standard and Compact PDFs.
3. Confirm both PDF pages have the expected order and orientation, then exercise
   Download, Open, and (when shown) Share / save.
4. Install/add PDF3000 to the home screen, switch the device offline, relaunch it,
   and repeat a short two-page scan.
5. Confirm the JustGiving link opens the configured external campaign and that no
   referral click is presented as a confirmed donation.

Constraints: free core functionality, no login, no image uploads, static-only
GitHub Pages compatibility, no required third-party JavaScript services.
Keep the donation link optional and separate from PDF creation.

## Acknowledgements

PDF3000 is built on standard browser capabilities documented by
[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API), including the File
and Blob APIs, Canvas, `createImageBitmap`, service workers, and the Web Share API.
Thanks to the browser teams and web-standards contributors who make private,
on-device applications like this possible.

PDF files are currently assembled by PDF3000's own small local PDF writer in
`scanner-core.js`. The application does not use a Google or Mozilla PDF conversion
API, external upload service, or third-party PDF JavaScript library. Future PDF.js
or pdf-lib adoption is only a roadmap proposal and would require local bundling and
security, license, and mobile-memory review.

## Privacy and limitations

All images and PDF generation run on the user's device. Page data is not persisted
after refreshing. The app does not automatically detect page edges or perform OCR.
Large image collections may exhaust device memory.

`PDF3000.com` is the proposed custom domain. Domain ownership and DNS configuration
have not been verified, so the deployment currently uses the GitHub Pages URL.
