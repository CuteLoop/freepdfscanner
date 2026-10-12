(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PageScanCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function safePdfName(value) {
    const base = String(value || '').trim().replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').replace(/^\.+|\.+$/g, '').replace(/\.pdf$/i, '').slice(0, 60) || 'scanned-pages';
    return base + '.pdf';
  }
  function pdfFromJpegs(images) {
    if (!Array.isArray(images) || images.length === 0) throw new Error('Add at least one page first.');
    const encoder = new TextEncoder(), parts = [], offsets = [0]; let position = 0;
    function append(bytes) { parts.push(bytes); position += bytes.length; }
    function text(value) { append(encoder.encode(value)); }
    function object(id, body) { offsets[id] = position; text(`${id} 0 obj\n${body}\nendobj\n`); }
    function stream(id, dictionary, bytes) { offsets[id] = position; text(`${id} 0 obj\n<< ${dictionary} /Length ${bytes.length} >>\nstream\n`); append(bytes); text('\nendstream\nendobj\n'); }
    text('%PDF-1.4\n%PageScan\n'); const kids = [];
    for (let index = 0; index < images.length; index += 1) {
      const id = 3 + index * 3, image = images[index];
      if (!image || image.w < 1 || image.h < 1 || !(image.bytes instanceof Uint8Array)) throw new Error('A PDF page contains invalid image data.');
      const pdfWidth = 595.28, pdfHeight = 841.89, margin = 22;
      const fit = Math.min((pdfWidth - 2 * margin) / image.w, (pdfHeight - 2 * margin) / image.h), width = image.w * fit, height = image.h * fit, x = (pdfWidth - width) / 2, y = (pdfHeight - height) / 2;
      kids.push(`${id} 0 R`);
      object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidth} ${pdfHeight}] /Resources << /XObject << /Im${index} ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`);
      stream(id + 1, `/Type /XObject /Subtype /Image /Width ${image.w} /Height ${image.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, image.bytes);
      stream(id + 2, '', encoder.encode(`q\n${width.toFixed(3)} 0 0 ${height.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)} cm\n/Im${index} Do\nQ\n`));
    }
    object(2, `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${images.length} >>`); object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    const startXref = position, objectCount = 2 + images.length * 3; text(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
    for (let id = 1; id <= objectCount; id += 1) text(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    text(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  return { pdfFromJpegs, safePdfName };
}));
