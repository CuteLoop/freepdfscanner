(function () {
  'use strict';
  const { pdfFromJpegs, safePdfName } = window.PDF3000Core;
  const pages = [], $ = (id) => document.getElementById(id);
  let busy = false, resultUrl = '', resultFile = null, offlineReady = false;

  function setPreviewTransform(image, rotation) {
    if (rotation % 180 === 0 || !image.naturalWidth || !image.naturalHeight) { image.style.transform = `rotate(${rotation}deg)`; return; }
    const boxRatio = 3 / 4, imageRatio = image.naturalWidth / image.naturalHeight;
    const drawnWidth = imageRatio > boxRatio ? 1 : imageRatio / boxRatio;
    const drawnHeight = imageRatio > boxRatio ? boxRatio / imageRatio : 1;
    image.style.transform = `rotate(${rotation}deg) scale(${Math.min(boxRatio / drawnHeight, 1 / (drawnWidth * boxRatio))})`;
  }
  function draw() {
    $('empty').hidden = pages.length > 0; $('area').hidden = pages.length === 0;
    $('counter').textContent = `${pages.length} page${pages.length === 1 ? '' : 's'}`;
    const root = $('pages'); root.replaceChildren();
    pages.forEach((page, index) => {
      const card = document.createElement('article'); card.className = 'card';
      const previewBox = document.createElement('div'); previewBox.className = 'previewbox';
      const image = document.createElement('img'); image.className = 'preview'; image.src = page.url; image.alt = `Scanned page ${index + 1}`; image.decoding = 'async'; image.style.imageOrientation = 'from-image'; image.onload = () => setPreviewTransform(image, page.rotation); previewBox.append(image);
      const foot = document.createElement('div'); foot.className = 'cardfoot';
      const name = document.createElement('div'); name.className = 'pageno'; name.textContent = `Page ${index + 1}`;
      const tools = document.createElement('div'); tools.className = 'tools';
      const actions = [
        ['←', 'Move earlier', () => move(index, -1)], ['→', 'Move later', () => move(index, 1)],
        ['↻', 'Rotate right', () => { page.rotation = (page.rotation + 90) % 360; clearResult(); draw(); }],
        ['✕', 'Remove page', () => { URL.revokeObjectURL(page.url); pages.splice(index, 1); clearResult(); draw(); }]
      ];
      actions.forEach(([symbol, title, handler], actionIndex) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = symbol; button.title = title; button.setAttribute('aria-label', `${title} page ${index + 1}`);
        button.disabled = (actionIndex === 0 && index === 0) || (actionIndex === 1 && index === pages.length - 1); if (actionIndex === 3) button.className = 'delete'; button.addEventListener('click', handler); tools.append(button);
      });
      foot.append(name, tools); card.append(previewBox, foot); root.append(card);
    });
  }
  function move(index, direction) { const target = index + direction; if (target < 0 || target >= pages.length) return; [pages[index], pages[target]] = [pages[target], pages[index]]; clearResult(); draw(); }
  async function add(files) {
    let rejected = 0;
    for (const file of files) { if (!file.type.startsWith('image/')) { rejected += 1; continue; } pages.push({ file, url: URL.createObjectURL(file), rotation: 0 }); }
    clearResult(); draw(); $('message').textContent = rejected ? `${rejected} non-image file${rejected === 1 ? ' was' : 's were'} skipped.` : '';
  }
  function onFiles(event) { add(Array.from(event.target.files || [])); event.target.value = ''; }

  async function decodeImage(page) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(page.file, { imageOrientation: 'from-image' }); }
      catch (error) { console.warn('createImageBitmap could not decode this page; using image fallback.', error); }
    }
    return new Promise((resolve, reject) => { const image = new Image(); image.style.imageOrientation = 'from-image'; image.onload = () => resolve(image); image.onerror = () => reject(new Error('This image could not be opened. Try converting it to JPEG or PNG.')); image.src = page.url; });
  }
  function canvasToJpegBytes(canvas) {
    return new Promise((resolve, reject) => canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('This browser could not compress a page image.')); return; }
      try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
    }, 'image/jpeg', 0.83));
  }
  async function renderPage(page, maxDimension) {
    const image = await decodeImage(page), sourceWidth = image.width || image.naturalWidth, sourceHeight = image.height || image.naturalHeight;
    if (!sourceWidth || !sourceHeight) throw new Error('A page has no readable image dimensions.');
    const rotated = page.rotation % 180 !== 0, orientedWidth = rotated ? sourceHeight : sourceWidth, orientedHeight = rotated ? sourceWidth : sourceHeight;
    const scale = Math.min(1, maxDimension / Math.max(orientedWidth, orientedHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(orientedWidth * scale)); canvas.height = Math.max(1, Math.round(orientedHeight * scale));
    const context = canvas.getContext('2d', { alpha: false }); if (!context) throw new Error('Could not create an image canvas.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.translate(canvas.width / 2, canvas.height / 2); context.rotate(page.rotation * Math.PI / 180); context.drawImage(image, -sourceWidth * scale / 2, -sourceHeight * scale / 2, sourceWidth * scale, sourceHeight * scale);
    if (typeof image.close === 'function') image.close();
    const bytes = await canvasToJpegBytes(canvas), output = { w: canvas.width, h: canvas.height, bytes }; canvas.width = 1; canvas.height = 1; return output;
  }
  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl); resultUrl = ''; resultFile = null; $('result').hidden = true; $('share').hidden = true; $('download').removeAttribute('href'); $('open').removeAttribute('href');
  }
  async function createPdf() {
    if (busy || pages.length === 0) return; busy = true; $('save').disabled = true; clearResult();
    try {
      const images = [], maxDimension = Number($('quality').value);
      for (let index = 0; index < pages.length; index += 1) { $('message').textContent = `Processing page ${index + 1} of ${pages.length}…`; await new Promise((resolve) => setTimeout(resolve, 20)); images.push(await renderPage(pages[index], maxDimension)); }
      $('message').textContent = 'Building PDF…';
      const blob = pdfFromJpegs(images), filename = safePdfName($('filename').value); resultUrl = URL.createObjectURL(blob);
      try { resultFile = new File([blob], filename, { type: 'application/pdf' }); } catch (_) { resultFile = null; }
      $('download').href = resultUrl; $('download').download = filename; $('open').href = resultUrl; $('result').hidden = false;
      const canShareFile = resultFile && navigator.share && (!navigator.canShare || navigator.canShare({ files: [resultFile] })); $('share').hidden = !canShareFile;
      $('message').textContent = `PDF ready: ${pages.length} page${pages.length === 1 ? '' : 's'} · ${(blob.size / 1024 / 1024).toFixed(1)} MB. If it does not download automatically, use a button below.`; $('download').click();
    } catch (error) { $('message').textContent = `Unable to create PDF: ${error.message}`; console.error(error); }
    finally { busy = false; $('save').disabled = false; }
  }
  async function sharePdf() { if (!resultFile || !navigator.share) return; try { await navigator.share({ files: [resultFile], title: resultFile.name }); } catch (error) { if (error.name !== 'AbortError') $('message').textContent = `Unable to share the PDF: ${error.message}`; } }
  function updateNetworkStatus() { const indicator = $('network'); indicator.textContent = navigator.onLine ? (offlineReady ? 'Offline ready' : 'On-device') : 'Offline'; indicator.classList.toggle('offline', !navigator.onLine); }

  $('camera').addEventListener('change', onFiles); $('gallery').addEventListener('change', onFiles); $('save').addEventListener('click', createPdf); $('share').addEventListener('click', sharePdf); $('filename').addEventListener('input', clearResult); $('quality').addEventListener('change', clearResult);
  $('clear').addEventListener('click', () => { if (!window.confirm('Remove all pages?')) return; pages.forEach((page) => URL.revokeObjectURL(page.url)); pages.length = 0; clearResult(); $('message').textContent = ''; draw(); });
  window.addEventListener('online', updateNetworkStatus); window.addEventListener('offline', updateNetworkStatus); window.addEventListener('beforeunload', () => { pages.forEach((page) => URL.revokeObjectURL(page.url)); if (resultUrl) URL.revokeObjectURL(resultUrl); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => { offlineReady = true; updateNetworkStatus(); }).catch((error) => console.warn('Offline mode is unavailable.', error)));
  updateNetworkStatus(); draw();
}());
