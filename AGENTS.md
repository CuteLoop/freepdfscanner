# Agent instructions for PageScan

This repository is a zero-build, static, mobile-first browser PDF scanner.

- Keep it deployable to GitHub Pages from `/` on `main`.
- Keep the core scanner free and all image processing on device.
- No upload API or analytics that includes document content.
- Maintain `index.html` as a directly runnable entrypoint unless explicitly migrating build systems.
- JustGiving fundraiser: https://www.justgiving.com/page/freepagescan?utm_medium=FA&utm_source=CL
- Do not interpret referral clicks as actual donations; JustGiving is the source of truth.
- Test with mobile camera/gallery, reordering, rotation, and multipage PDFs.
