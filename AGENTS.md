# Agent instructions for PDF3000

This repository is a zero-build, static, mobile-first browser PDF toolkit. The
currently implemented tool is the photo-to-PDF scanner; future tools are tracked in
`ROADMAP.md` and must not be presented as already available.

- Keep it deployable to GitHub Pages from `/` on `main`.
- Keep the core scanner free and all image processing on device.
- No upload API or analytics that includes document content.
- Maintain `index.html` as a directly runnable entrypoint unless explicitly migrating build systems.
- Use **PDF3000** as the public product name and preserve the privacy promise: free,
  simple, and processed on the user's device.
- JustGiving fundraiser: https://www.justgiving.com/page/freepagescan?utm_medium=FA&utm_source=CL
- Do not interpret referral clicks as actual donations; JustGiving is the source of truth.
- Test with mobile camera/gallery, reordering, rotation, and multipage PDFs.
- Do not configure `pdf3000.com` until ownership and DNS access are confirmed.
