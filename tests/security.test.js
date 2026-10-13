'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('index.html');
const app = read('app.js');
const core = read('scanner-core.js');
const worker = read('sw.js');
const workflow = read('.github/workflows/deploy.yml');

const csp = html.match(/Content-Security-Policy" content="([^"]+)"/);
assert.ok(csp, 'index.html must define a Content Security Policy');
assert.match(csp[1], /script-src 'self' file:/, 'scripts must be restricted to local files');
assert.doesNotMatch(csp[1], /script-src[^;]*'unsafe-inline'/, 'inline scripts must remain blocked');
assert.match(csp[1], /object-src 'none'/);
assert.match(csp[1], /base-uri 'none'/);
assert.match(html, /name="referrer" content="no-referrer"/);
assert.match(html, /justgiving\.com[^\"]+" target="_blank" rel="noopener noreferrer"/);

const browserCode = `${html}\n${app}\n${core}`;
assert.doesNotMatch(browserCode, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b/);
assert.doesNotMatch(browserCode, /\beval\s*\(|\bnew\s+Function\b/);

assert.match(worker, /name\.startsWith\(CACHE_PREFIX\)/, 'cache cleanup must be scoped to PDF3000');
assert.match(worker, /url\.origin !== self\.location\.origin/, 'service worker must ignore cross-origin requests');

const actionRefs = Array.from(workflow.matchAll(/uses:\s+[^@\s]+@([^\s]+)/g), (match) => match[1]);
assert.ok(actionRefs.length >= 4, 'expected official Pages actions');
for (const ref of actionRefs) assert.match(ref, /^[0-9a-f]{40}$/, `action ref must be an immutable SHA: ${ref}`);
assert.match(workflow, /persist-credentials:\s*false/);
assert.match(workflow, /contents:\s*read/);
assert.match(workflow, /pages:\s*write/);
assert.match(workflow, /id-token:\s*write/);
assert.match(workflow, /needs:\s*build/);
assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/);

console.log('PDF3000 security regression tests passed.');
