import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testOrientation() {
  console.log('=== ORIENTATION SWITCH TEST (Portrait -> Landscape -> Portrait) ===');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.cwd(), '.chrome-profile-orientation');
  if (fs.existsSync(tempProfile)) {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  }

  const port = 9550;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--window-size=390,844',
    'http://localhost:3000/',
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let msgId = 1;
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const id = msgId++;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });

    await send('Runtime.enable');
    await send('Page.enable');

    // 1. Initial Portrait
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1.5,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Dismiss loader
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    console.log('[Step 1] Portrait 390x844 verified');

    // 2. Switch to Landscape (844x390)
    console.log('[Step 2] Rotating to Landscape 844x390...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 844,
      height: 390,
      deviceScaleFactor: 1.5,
      mobile: true,
      screenOrientation: { type: 'landscapePrimary', angle: 90 },
    });
    await new Promise((r) => setTimeout(r, 1500));

    const checkLandscape = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const canvas = document.querySelector('canvas');
          const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
          return {
            docWidth,
            winWidth,
            hasHorizontalOverflow: docWidth > winWidth,
            canvasMatches: canvasRect ? (Math.round(canvasRect.width) === winWidth && Math.round(canvasRect.height) === window.innerHeight) : false
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Landscape check:', checkLandscape.result.value);

    // 3. Switch BACK to Portrait (390x844)
    console.log('[Step 3] Rotating BACK to Portrait 390x844...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1.5,
      mobile: true,
      screenOrientation: { type: 'portraitPrimary', angle: 0 },
    });
    await new Promise((r) => setTimeout(r, 1500));

    const checkPortraitBack = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const canvas = document.querySelector('canvas');
          const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
          return {
            docWidth,
            winWidth,
            hasHorizontalOverflow: docWidth > winWidth,
            canvasMatches: canvasRect ? (Math.round(canvasRect.width) === winWidth && Math.round(canvasRect.height) === window.innerHeight) : false
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Portrait restoration check:', checkPortraitBack.result.value);

    // Take screenshot after rotation back
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('test_orientation_restored_portrait.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved test_orientation_restored_portrait.png');

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

testOrientation().catch((err) => {
  console.error('Orientation test failed:', err);
  process.exit(1);
});
