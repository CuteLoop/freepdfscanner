# PDF3000 roadmap

PDF3000's goal is to provide useful PDF tools that are free, simple, and private by
default. Document content should remain on the user's device, with no account,
watermark, subscription, or required upload service.

## Current release

The photo-to-PDF scanner is implemented. It supports mobile camera and gallery
input, page previews, rotation, reordering, deletion, resolution selection,
multipage PDF export, mobile save/share fallbacks, and offline PWA use.

The features below are plans, not currently available functionality.

## Stage 1 — Document organization

1. Open existing PDFs and render memory-efficient page thumbnails.
2. Add, delete, rotate, and reorder pages in one document workspace.
3. Merge several PDFs and images into one document.
4. Split or extract selected page ranges.
5. Crop pages and support A4, US Letter, and custom output sizes.
6. Add a handwritten visual signature from touch/mouse input or an image.

A visual signature is not a certificate-backed cryptographic digital signature and
must be described accordingly. Cropping must distinguish between changing the
visible crop box and securely removing content outside that region.

## Stage 2 — Editing and optimization

1. Add text, dates, initials, checkmarks, highlights, drawings, and simple shapes as
   overlays.
2. Fill supported PDF form fields.
3. Add page numbers, margins, watermarks, and orientation controls.
4. Convert PDF pages to images and optionally create grayscale output.
5. Compress image-heavy PDFs, including a best-effort target-size mode.
6. Detect blank scanned pages and offer removal.
7. Add undo/redo and optional local session recovery.

A requested compression target cannot be guaranteed for every document and the UI
must make that limitation clear.

## Later research

- Local OCR for searchable scanned PDFs.
- Automatic document edge detection and perspective correction.
- Metadata inspection and removal.
- Secure redaction with tests proving removed content cannot be recovered.
- Certificate-backed signing only if its identity and tamper-evidence requirements
  can be implemented and explained correctly.

## Engineering requirements

- Keep the application static and deployable from the repository root on GitHub
  Pages.
- Keep core tools free and process document content locally.
- Bundle and audit any future third-party libraries; do not load document-processing
  code from a CDN at runtime.
- Render large documents incrementally instead of keeping full-resolution pages in
  memory.
- Preserve the optional JustGiving fundraiser as separate from document operations.
- Add regression fixtures for unusual PDFs, encrypted files, malformed inputs,
  rotation, page boxes, forms, annotations, and mobile memory limits.
- Do not claim a roadmap feature is available until it is implemented and tested.

Potential libraries should be evaluated when each feature is implemented. PDF.js may
help render existing PDFs, while pdf-lib may help copy and modify pages. Neither is a
remote PDF service, but both would still require dependency review, version pinning,
local bundling, license review, and mobile testing before adoption.
