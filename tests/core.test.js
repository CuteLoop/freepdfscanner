'use strict';
const assert = require('node:assert/strict');
const { pdfFromJpegs, safePdfName } = require('../scanner-core.js');
async function run() {
  assert.equal(safePdfName(' Homework / week 1.pdf '), 'Homework - week 1.pdf'); assert.equal(safePdfName('...'), 'pdf3000-document.pdf'); assert.equal(safePdfName('scan.PDF'), 'scan.pdf');
  const a = new Uint8Array([0xff,0xd8,0xff,0xd9]), b = new Uint8Array([0xff,0xd8,1,2,3,0xff,0xd9]);
  const blob = pdfFromJpegs([{w:1200,h:1600,bytes:a},{w:1600,h:1200,bytes:b}]); const bytes = new Uint8Array(await blob.arrayBuffer()); const text = new TextDecoder('latin1').decode(bytes);
  assert.ok(text.startsWith('%PDF-1.4')); assert.match(text,/\/Count 2/); assert.equal((text.match(/\/Subtype \/Image/g)||[]).length,2); assert.match(text,/\/Width 1200 \/Height 1600/); assert.match(text,/\/Width 1600 \/Height 1200/); assert.match(text,/%%EOF$/); assert.ok(bytes.includes(0xff));
  assert.throws(() => pdfFromJpegs([]),/at least one page/i); assert.throws(() => pdfFromJpegs([{w:0,h:10,bytes:a}]),/invalid image data/i); console.log('PDF3000 core tests passed.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
