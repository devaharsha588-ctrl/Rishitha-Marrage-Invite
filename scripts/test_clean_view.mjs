import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:\\Users\\Admin\\.chrome-clean',
    '--window-size=1280,800',
    'http://localhost:3000/',
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const list = await (await fetch('http://127.0.0.1:9223/json/list')).json();
    const page = list.find((t) => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    const send = (method, params = {}) =>
      new Promise((res) => {
        const curId = id++;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            res(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

    await send('Runtime.enable');
    await send('Page.enable');
    await new Promise((r) => setTimeout(r, 3500));

    // Dismiss loader
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
          if (btn) btn.click();
        })()
      `,
    });

    await new Promise((r) => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('clean_hero.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved clean_hero.png successfully');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
