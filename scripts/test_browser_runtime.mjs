import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('=== REAL BROWSER RUNTIME TEST ===\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.cwd(), '.chrome-test-profile');
  if (fs.existsSync(tempProfile)) {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  }

  // 1. Launch Headless Chrome with CDP
  console.log('1. Launching Headless Chrome on port 9222...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu-program-cache',
    '--no-first-run',
    '--window-size=1280,800',
    'http://localhost:3000/?assetDebug=1&motionDebug=1',
  ]);

  // Wait 3 seconds for Chrome to initialize
  await new Promise((r) => setTimeout(r, 3000));

  try {
    // 2. Query targets
    console.log('2. Querying Chrome targets...');
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();

    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      throw new Error('No page target found!');
    }

    console.log('Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    console.log('WebSocket connected. Enabling CDP domains...\n');

    let msgId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const networkRequests = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg.result);
        pending.delete(msg.id);
      }

      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
        console.log(`[BROWSER CONSOLE ${msg.params.type.toUpperCase()}]`, text);
      }

      if (msg.method === 'Network.responseReceived') {
        const url = msg.params.response.url;
        const status = msg.params.response.status;
        const mime = msg.params.response.mimeType;
        if (url.includes('/images/')) {
          networkRequests.push({ url, status, mime });
          console.log(`[BROWSER NETWORK] ${status} ${mime} <- ${url}`);
        }
      }
    };

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve) => {
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Network.enable');
    await send('Page.enable');

    // Wait for images to load
    console.log('Waiting for assets...');
    await new Promise((r) => setTimeout(r, 4000));

    // Dismiss preloader by clicking "Skip directly to invitation"
    console.log('\n3. Dismissing preloader to reveal Hero scene...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
          if (btn) btn.click();
        })()
      `,
    });

    // Wait 1.5s for loader fade transition
    await new Promise((r) => setTimeout(r, 1500));

    // Helper to capture scene screenshot
    async function captureScene(name, scrollTargetSelector) {
      if (scrollTargetSelector) {
        await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('${scrollTargetSelector}');
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            })()
          `,
        });
        await new Promise((r) => setTimeout(r, 800));
      }

      const evalData = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const canvas = document.querySelector('canvas');
            const gl = canvas ? (canvas.getContext('webgl2') || canvas.getContext('webgl')) : null;
            return {
              scrollY: window.scrollY,
              glError: gl ? gl.getError() : null
            };
          })()
        `,
        returnByValue: true,
      });

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filename = `scene_${name}.png`;
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`[CAPTURED] ${filename} at scrollY: ${evalData.result.value.scrollY}, glError: ${evalData.result.value.glError}`);
    }

    console.log('\n4. Capturing all 8 scenes visually...');
    await captureScene('01_hero', null);
    await captureScene('02_countdown', '#countdown');
    await captureScene('03_haldi', '#event-haldi');
    await captureScene('04_pellikuthuru', '#event-pellikuthuru');
    await captureScene('05_ceremony', '#event-ceremony');
    await captureScene('06_join', '#join');
    await captureScene('07_venue', '#venue');
    await captureScene('08_closing', '#closing');

    // 5. Final Diagnostic Analysis
    const imageOkLogs = consoleLogs.filter((l) => l.text.includes('[IMAGE OK]'));
    const textureOkLogs = consoleLogs.filter((l) => l.text.includes('[TEXTURE OK]'));
    const failedLogs = consoleLogs.filter((l) => l.text.includes('FAILED') || l.type === 'error');

    console.log('\n=== REAL BROWSER VERIFICATION SUMMARY ===');
    console.log('Image Preloads OK:', imageOkLogs.length, '/ 7');
    console.log('WebGL Textures OK:', textureOkLogs.length, '/ 7');
    console.log('Network Requests for /images/:', networkRequests.length);
    console.log('Errors / Failures:', failedLogs.length);

    ws.close();
  } finally {
    chrome.kill();
    if (fs.existsSync(tempProfile)) {
      try {
        fs.rmSync(tempProfile, { recursive: true, force: true });
      } catch (_) {}
    }
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
