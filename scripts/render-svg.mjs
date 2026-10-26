#!/usr/bin/env node
// Dependency-free SVG rasterization through an isolated Chrome DevTools pipe.
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const HELP = `Render a local, self-contained SVG to a transparent PNG.

Usage: node scripts/render-svg.mjs input.svg --out output.png [--width integer] [--scale number]

  --out      Required PNG destination. Parent directories are created.
  --width    Output width in CSS pixels; height preserves the SVG aspect ratio.
             Defaults to the SVG width/height, or its viewBox dimensions.
  --scale    Device pixel ratio, greater than zero (default: 1).
  --help     Show this help.

Requires Node.js 20.10+ and installed Chrome or Chromium. No npm packages.
Set CHROME_PATH to an executable to override automatic browser discovery.
Images render without external resources or script execution. Existing SVG
backgrounds are preserved; an unpainted background remains transparent.
`;

function options(argv) {
  const opts = { scale: 1 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (['--out', '--width', '--scale'].includes(arg)) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      opts[arg.slice(2)] = arg === '--out' ? value : Number(value);
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (opts.input) throw new Error(`Unexpected argument: ${arg}`);
    else opts.input = arg;
  }
  if (!opts.input || !opts.out) throw new Error('Supply input.svg and --out output.png. Use --help for usage.');
  if (!/\.png$/i.test(opts.out)) throw new Error('--out must have a .png extension.');
  if (opts.width !== undefined && (!Number.isSafeInteger(opts.width) || opts.width < 1)) {
    throw new Error('--width must be a positive integer.');
  }
  if (!Number.isFinite(opts.scale) || opts.scale <= 0) throw new Error('--scale must be a finite number greater than zero.');
  if (resolve(opts.input) === resolve(opts.out)) throw new Error('Input and output must be different files.');
  return opts;
}

async function chromePath() {
  const candidates = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    join(homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/snap/bin/chromium',
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].flatMap(key => process.env[key]
      ? [join(process.env[key], 'Google/Chrome/Application/chrome.exe'), join(process.env[key], 'Chromium/Application/chrome.exe')]
      : []),
    ...(process.env.PATH || '').split(delimiter).flatMap(dir =>
      (process.platform === 'win32' ? ['chrome.exe', 'chromium.exe'] : ['google-chrome', 'chromium', 'chromium-browser'])
        .map(name => join(dir, name))),
  ];
  for (const candidate of candidates) {
    try { await access(candidate, constants.X_OK); return candidate; } catch { /* Try the next standard location. */ }
  }
  throw new Error(process.env.CHROME_PATH
    ? `CHROME_PATH is not an executable: ${process.env.CHROME_PATH}`
    : 'Chrome or Chromium was not found. Install one or set CHROME_PATH to its executable.');
}

function devtools(child) {
  let sequence = 0, buffer = '', failure;
  const pending = new Map();
  const fail = error => {
    failure = error;
    for (const request of pending.values()) { clearTimeout(request.timer); request.reject(error); }
    pending.clear();
  };
  child.on('error', error => fail(new Error(`Could not start Chrome: ${error.message}`)));
  child.on('exit', (code, signal) => fail(new Error(`Chrome exited (${signal || code}).`)));
  child.stdio[3].on('error', fail);
  child.stdio[4].on('error', fail);
  child.stdio[4].setEncoding('utf8');
  child.stdio[4].on('data', chunk => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\0')) !== -1) {
      const raw = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      if (!raw) continue;
      let message;
      try { message = JSON.parse(raw); } catch { fail(new Error('Invalid response from Chrome.')); return; }
      const request = pending.get(message.id);
      if (!request) continue;
      pending.delete(message.id);
      clearTimeout(request.timer);
      if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
      else request.resolve(message.result);
    }
  });
  return (method, params = {}, sessionId) => new Promise((resolveCall, reject) => {
    if (failure) { reject(failure); return; }
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Chrome timed out during ${method}.`));
    }, 15_000);
    pending.set(id, { method, resolve: resolveCall, reject, timer });
    child.stdio[3].write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
  });
}

async function render(svg, opts, binary) {
  const profile = await mkdtemp(join(tmpdir(), 'superintelligence-render-'));
  let child, exited, stderr = '';
  try {
    child = spawn(binary, [
      '--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--no-startup-window',
      '--disable-background-networking', '--disable-component-update', '--disable-sync',
      '--disable-extensions', '--disable-default-apps', '--hide-scrollbars',
    ], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
    child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-3000); });
    const send = devtools(child);
    exited = new Promise(done => child.once('close', done));
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const page = (method, params) => send(method, params, sessionId);
    const evaluate = async expression => {
      const reply = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (reply.exceptionDetails) throw new Error(reply.exceptionDetails.exception?.description || reply.exceptionDetails.text);
      return reply.result.value;
    };
    await page('Network.enable');
    await page('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'file://*', 'ftp://*'] });
    // Parse as XML before rasterizing. An <img> keeps SVG scripts inert and blocks external assets.
    const size = await evaluate(`(() => {
      const doc = new DOMParser().parseFromString(${JSON.stringify(svg)}, 'image/svg+xml');
      const root = doc.documentElement;
      if (doc.querySelector('parsererror') || root.localName !== 'svg' || root.namespaceURI !== 'http://www.w3.org/2000/svg') {
        throw new Error('Input is not a valid SVG document.');
      }
      const length = name => {
        const value = root.getAttribute(name) || '';
        return /^\\s*(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:px)?\\s*$/.test(value) ? parseFloat(value) : 0;
      };
      const box = (root.getAttribute('viewBox') || '').trim().split(/[\\s,]+/).map(Number);
      const validBox = box.length === 4 && box.every(Number.isFinite) && box[2] > 0 && box[3] > 0;
      let width = length('width'), height = length('height');
      if (!width && validBox) width = height ? height * box[2] / box[3] : box[2];
      if (!height && validBox) height = width * box[3] / box[2];
      if (!(width > 0 && height > 0)) throw new Error('SVG needs positive width/height in pixels or a valid viewBox.');
      return { width, height };
    })()`);
    const width = opts.width ?? Math.round(size.width);
    const height = Math.round(width * size.height / size.width);
    const pixels = [Math.round(width * opts.scale), Math.round(height * opts.scale)];
    if (![width, height, ...pixels].every(value => Number.isSafeInteger(value) && value > 0)) {
      throw new Error('The requested dimensions produce an invalid or zero-size image.');
    }
    await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: opts.scale, mobile: false });
    await page('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
    await evaluate(`(async () => {
      document.documentElement.style.cssText = 'margin:0;padding:0;background:transparent;overflow:hidden';
      document.body.style.cssText = 'margin:0;padding:0;background:transparent;overflow:hidden';
      const img = document.createElement('img');
      img.style.cssText = 'display:block;width:${width}px;height:${height}px';
      img.src = 'data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}';
      document.body.replaceChildren(img);
      await img.decode();
      await document.fonts.ready;
      await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
    })()`);
    const { data } = await page('Page.captureScreenshot', {
      format: 'png', fromSurface: true, captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    const png = Buffer.from(data, 'base64');
    if (png.length < 24 || png.readUInt32BE(16) !== pixels[0] || png.readUInt32BE(20) !== pixels[1]) {
      throw new Error('Chrome returned unexpected PNG dimensions. Try an integer --scale.');
    }
    return { png, pixels };
  } catch (error) {
    throw new Error(`${error.message}${stderr.trim() ? `\nChrome: ${stderr.trim()}` : ''}`);
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL');
      let timer;
      try { await Promise.race([exited, new Promise(done => { timer = setTimeout(done, 2000); })]); }
      finally { clearTimeout(timer); }
    }
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

async function main() {
  const opts = options(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return; }
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 20 || (major === 20 && minor < 10)) throw new Error('Node.js 20.10 or newer is required.');
  const svg = await readFile(resolve(opts.input), 'utf8');
  const { png, pixels } = await render(svg, opts, await chromePath());
  const out = resolve(opts.out);
  await mkdir(dirname(out), { recursive: true });
  const temporary = `${out}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, png, { flag: 'wx' });
    await rename(temporary, out);
  } finally { await rm(temporary, { force: true }); }
  console.log(`Rendered ${pixels[0]}×${pixels[1]} PNG: ${out}`);
}

main().catch(error => { console.error(`render-svg: ${error.message}`); process.exitCode = 1; });
