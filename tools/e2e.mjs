#!/usr/bin/env node
// End-to-end test: drives the real UI in headless Chrome over the DevTools
// Protocol, using only Node built-ins (node:http static server + the global
// WebSocket of Node ≥ 22). Zero npm dependencies.
//
// Scenario: boot the app, dismiss the beginner primer, set turbo speed, solve
// two levels by typing the reference commands into the real editor, assert the
// pass banner + localStorage progress + the animated bit grid, then exercise
// language switching (incl. ?lang=) and the sandbox.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { SOLUTIONS } from '../tests/solutions.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEADLINE_MS = 90000;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/plain',
};

let passed = 0;
function ok(name) { passed += 1; console.log(`ok — ${name}`); }
function fail(msg) { console.error(`FAIL — ${msg}`); process.exitCode = 1; throw new Error(msg); }

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
      const file = join(ROOT, path === '/' ? 'index.html' : path.slice(1));
      if (!file.startsWith(ROOT)) throw new Error('traversal');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN, 'google-chrome-stable', 'google-chrome', 'chromium',
    'chromium-browser', 'chrome', '/snap/bin/chromium', '/usr/bin/chromium',
  ].filter(Boolean);
  for (const bin of candidates) {
    try { if (spawnSync(bin, ['--version'], { stdio: 'pipe' }).status === 0) return bin; } catch { /* next */ }
  }
  console.error('No Chrome/Chromium found. Set CHROME_BIN=/path/to/chrome.');
  process.exit(1);
  return null;
}

function launchChrome(bin, profileDir) {
  const chrome = spawn(bin, [
    '--headless=new', '--remote-debugging-port=0', '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-extensions',
    `--user-data-dir=${profileDir}`, 'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  return new Promise((resolve, reject) => {
    let buf = '';
    const onData = (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) { chrome.stderr.off('data', onData); resolve({ chrome, wsBase: m[1] }); }
    };
    chrome.stderr.on('data', onData);
    chrome.on('exit', (code) => reject(new Error(`chrome exited early (${code})\n${buf}`)));
    setTimeout(() => reject(new Error(`no DevTools banner:\n${buf}`)), 15000);
  });
}

class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.consoleErrors = [];
    ws.addEventListener('message', (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        if (p) { this.pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); }
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        this.consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        this.consoleErrors.push(`exception: ${d.text} ${d.exception?.description ?? ''}`);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`eval failed: ${r.exceptionDetails.text}\n${expression}`);
    return r.result.value;
  }

  async waitFor(expression, what, timeout = 15000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (await this.eval(expression)) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    fail(`timeout waiting for ${what}: ${expression}`);
  }
}

function openWs(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => resolve(ws));
    ws.addEventListener('error', (e) => reject(new Error(`ws error: ${e.message ?? url}`)));
  });
}

async function connect(wsBase) {
  const browser = new Cdp(await openWs(wsBase));
  const { targetInfos } = await browser.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  if (!page) fail('no page target');
  const cdp = new Cdp(await openWs(wsBase.replace(/\/devtools\/browser\/.*/, `/devtools/page/${page.targetId}`)));
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  return cdp;
}

async function solveLevel(cdp, levelId) {
  await cdp.eval(`location.hash = ${JSON.stringify(`#${levelId}`)}`);
  await cdp.waitFor(
    `document.querySelector('.lesson-title') && location.hash === ${JSON.stringify(`#${levelId}`)}`,
    `level ${levelId} loaded`,
  );
  await cdp.eval(`(() => {
    const ta = document.querySelector('.card-editor textarea.code');
    ta.value = ${JSON.stringify(SOLUTIONS[levelId])};
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await cdp.eval(`document.getElementById('btnRun').click()`);
  await cdp.waitFor('!!document.querySelector("#lessonPanel .banner-pass")', `pass banner for ${levelId}`, 20000);
  const progress = await cdp.eval('JSON.parse(localStorage.getItem("numsim.progress") ?? "[]")');
  if (!progress.includes(levelId)) fail(`progress does not contain ${levelId}`);
  ok(`level ${levelId} solved via UI (banner + progress)`);
}

async function main() {
  const hardDeadline = setTimeout(() => { console.error('GLOBAL DEADLINE EXCEEDED'); process.exit(1); }, DEADLINE_MS);
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const profileDir = mkdtempSync(join(tmpdir(), 'edunum-e2e-'));
  const bin = findChrome();
  console.log(`# chrome: ${bin}`);
  const { chrome, wsBase } = await launchChrome(bin, profileDir);

  try {
    const cdp = await connect(wsBase);
    await cdp.send('Page.navigate', { url: `${base}/#bit-weights` });
    await cdp.waitFor('!!document.querySelector(".lesson-title")', 'app boot');
    ok('app boots from hash #bit-weights');

    await cdp.eval('localStorage.clear()');
    await cdp.send('Page.navigate', { url: `${base}/#bit-weights` });
    await cdp.waitFor('!!document.querySelector(".lesson-title")', 'app reboot');

    // beginner primer auto-opens on first visit; dismiss it and confirm it
    // stays closed after a reload
    await cdp.waitFor('!document.getElementById("introOverlay").hidden', 'beginner primer auto-opens');
    await cdp.waitFor('document.querySelectorAll("#introBody h3").length >= 4', 'primer content rendered');
    await cdp.eval('document.getElementById("introClose").click()');
    await cdp.waitFor('document.getElementById("introOverlay").hidden', 'primer closed');
    await cdp.send('Page.navigate', { url: `${base}/#bit-weights` });
    await cdp.waitFor('!!document.querySelector(".lesson-title")', 'reload after primer');
    if (await cdp.eval('!document.getElementById("introOverlay").hidden')) fail('primer reopened despite flag');
    ok('beginner primer: auto-opens once, then stays behind the Basics button');

    await cdp.eval(`(() => { const s = document.getElementById('speed'); s.value = s.max; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    ok('turbo speed set');

    await solveLevel(cdp, 'bit-weights');
    // the bit grid rendered the 8-bit pattern
    await cdp.waitFor('document.querySelectorAll("#bitGrid .bg-cell").length === 8', 'bit grid shows 8 cells');
    await cdp.waitFor('document.querySelectorAll("#resultPanel .stat").length >= 2', 'result panel filled');
    ok('bit grid + result panel populated');

    await solveLevel(cdp, 'dec-to-bin');

    await cdp.eval('document.getElementById("btnLevels").click()');
    await cdp.waitFor('document.querySelectorAll("#levelSelectOverlay .level-card.done").length >= 2', 'level map with 2 done');
    await cdp.eval('document.querySelector("#levelSelectOverlay .modal-close").click()');
    ok('level map shows 2 completed levels');

    await cdp.eval('document.querySelector(".lang-switch [data-lang=\'en\']").click()');
    if (await cdp.eval('document.getElementById("btnLevels").textContent.trim()') !== 'Levels') fail('EN nav label');
    await cdp.eval('document.querySelector(".lang-switch [data-lang=\'it\']").click()');
    if (await cdp.eval('document.getElementById("btnLevels").textContent.trim()') !== 'Livelli') fail('IT nav label');
    ok('language switch IT ⇄ EN');

    await cdp.send('Page.navigate', { url: `${base}/?lang=en#bit-weights` });
    await cdp.waitFor('document.getElementById("btnLevels")?.textContent.trim() === "Levels"', '?lang=en forces English');
    ok('?lang=xx forces the language (URL > localStorage)');

    // sandbox: free command runs to completion
    await cdp.eval(`(() => { const s = document.getElementById('speed'); s.value = s.max; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    await cdp.eval('document.getElementById("btnSandbox").click()');
    await cdp.waitFor('document.getElementById("casesCard").hidden', 'sandbox mode (no cases)');
    await cdp.eval('document.getElementById("btnRun").click()');
    await cdp.waitFor('document.getElementById("statusLine").dataset.kind === "ok"', 'sandbox run completes');
    ok('sandbox runs the free command');

    if (cdp.consoleErrors.length) fail(`console errors:\n${cdp.consoleErrors.join('\n')}`);
    ok('zero console errors / exceptions');

    console.log(`\n# e2e passed (${passed} checks)`);
  } finally {
    clearTimeout(hardDeadline);
    chrome.kill('SIGKILL');
    server.close();
    try { rmSync(profileDir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
