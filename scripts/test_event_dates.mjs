import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'mobile_375x812', width: 375, height: 812 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
];

async function testViewportDates(vp) {
  console.log(`\n========================================`);
  console.log(`TESTING EVENT DATES: ${vp.name} (${vp.width}x${vp.height})`);
  console.log(`========================================`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.cwd(), `.chrome-profile-dates-${vp.name}`);
  if (fs.existsSync(tempProfile)) {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  }

  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
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

    await new Promise((r) => setTimeout(r, 2500));

    // Dismiss preloader
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1500));

    const events = [
      { name: 'haldi', sel: '#event-haldi', date: '11 DECEMBER' },
      { name: 'bride_to_be', sel: '#event-pellikuthuru', date: '12 DECEMBER' },
      { name: 'ceremony', sel: '#event-ceremony', date: '13 DECEMBER' },
    ];

    for (const ev of events) {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${ev.sel}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
          })()
        `,
      });

      // Wait for scroll & animation timeline (date reveals, divider expands, title reveals)
      await new Promise((r) => setTimeout(r, 1800));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const filename = `test_date_${vp.name}_${ev.name}.png`;
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${filename} (${ev.date})`);
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
  for (const vp of VIEWPORTS) {
    await testViewportDates(vp);
  }
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
