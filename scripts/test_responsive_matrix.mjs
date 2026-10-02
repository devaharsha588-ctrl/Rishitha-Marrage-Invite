import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'mobile_375x812', width: 375, height: 812 },
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'mobile_412x915', width: 412, height: 915 },
  { name: 'landscape_844x390', width: 844, height: 390 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
];

async function testViewport(vp) {
  console.log(`\n========================================`);
  console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
  console.log(`========================================`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.cwd(), `.chrome-profile-${vp.name}`);
  if (fs.existsSync(tempProfile)) {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  }

  const port = 9300 + Math.floor(Math.random() * 500);

  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu-program-cache',
    '--no-first-run',
    `--window-size=${vp.width},${vp.height}`,
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.width < 640 ? 1.5 : 2.0,
      mobile: vp.width < 1024,
    });

    // Wait for initial load
    await new Promise((r) => setTimeout(r, 3000));

    // Dismiss preloader
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
          if (btn) btn.click();
        })()
      `,
    });

    // Wait 4.5s for loader fadeout and full Hero entrance timeline to complete
    await new Promise((r) => setTimeout(r, 4500));

    // Check horizontal overflow
    const overflowCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const bodyWidth = document.body.scrollWidth;
          const canvas = document.querySelector('canvas');
          const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
          return {
            docWidth,
            winWidth,
            bodyWidth,
            hasHorizontalOverflow: docWidth > winWidth || bodyWidth > winWidth,
            canvasMatchesViewport: canvasRect ? (Math.round(canvasRect.width) === winWidth && Math.round(canvasRect.height) === window.innerHeight) : false
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('Layout Verification:', overflowCheck.result.value);

    // Capture Hero Screenshot
    const heroShot = await send('Page.captureScreenshot', { format: 'png' });
    const heroFilename = `test_${vp.name}_hero.png`;
    fs.writeFileSync(heroFilename, Buffer.from(heroShot.data, 'base64'));
    console.log(`Saved screenshot: ${heroFilename}`);

    // If mobile 390x844, also capture other sections to verify
    if (vp.name === 'mobile_390x844') {
      const sections = [
        { name: 'countdown', sel: '#countdown' },
        { name: 'haldi', sel: '#event-haldi' },
        { name: 'mandapam', sel: '#event-pellikuthuru' },
        { name: 'ceremony', sel: '#event-ceremony' },
        { name: 'rsvp', sel: '#join' },
        { name: 'venue', sel: '#venue' },
        { name: 'closing', sel: '#closing' },
      ];

      for (const s of sections) {
        await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('${s.sel}');
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            })()
          `,
        });
        await new Promise((r) => setTimeout(r, 800));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const fn = `test_mobile_390_${s.name}.png`;
        fs.writeFileSync(fn, Buffer.from(shot.data, 'base64'));
        console.log(`Saved section screenshot: ${fn}`);
      }
    }

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

async function main() {
  console.log('=== MULTI-VIEWPORT RESPONSIVENESS TEST SUITE ===');
  const target = process.argv[2];
  const list = target ? VIEWPORTS.filter((v) => v.name.includes(target)) : VIEWPORTS;
  for (const vp of list) {
    await testViewport(vp);
  }
  console.log('\n=== VIEWPORT TEST RUN COMPLETED ===');
}

main().catch((err) => {
  console.error('Test matrix failed:', err);
  process.exit(1);
});
