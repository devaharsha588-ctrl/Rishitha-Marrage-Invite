import { spawn } from 'child_process';

async function testBackToBeginning() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9222;
  const tempProfile = `C:\\Users\\Admin\\.gemini\\chrome_b2b_${Date.now()}`;

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
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
    await new Promise((r) => setTimeout(r, 3500));

    // 1. Initial State (scrollY = 0)
    const initialCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Back to beginning of invitation"]');
          if (!btn) return { found: false };
          const container = btn.parentElement;
          const style = window.getComputedStyle(container);
          return {
            found: true,
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            scrollY: window.scrollY
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[1. Initial State (scrollY=0)]:', initialCheck.result.value);

    // 2. Scroll to 1500px
    await send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, 1500); window.dispatchEvent(new Event("scroll"));',
    });
    await new Promise((r) => setTimeout(r, 800));

    const scrolledCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Back to beginning of invitation"]');
          if (!btn) return { found: false };
          const container = btn.parentElement;
          const style = window.getComputedStyle(container);
          return {
            found: true,
            opacity: style.opacity,
            pointerEvents: style.pointerEvents,
            scrollY: window.scrollY
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[2. Scrolled State (scrollY=1500)]:', scrolledCheck.result.value);

    // 3. Click the button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Back to beginning of invitation"]');
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1200));

    const returnCheck = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            scrollY: window.scrollY
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[3. After Back to Beginning Click]:', returnCheck.result.value);

    ws.close();
  } finally {
    chrome.kill();
  }
}

testBackToBeginning().catch(console.error);
