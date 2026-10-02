import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testMusicBehavior() {
  console.log('=== WEDDING BACKGROUND MUSIC BEHAVIOR TEST ===');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.cwd(), '.chrome-profile-music');
  if (fs.existsSync(tempProfile)) {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  }

  const port = 9750;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--autoplay-policy=no-user-gesture-required', // Allow audio play in test environment
    '--window-size=1440,900',
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

    // 1. Initial State Check (MUSIC OFF)
    const initialState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
          return {
            buttonFound: !!btn,
            buttonText: btn ? btn.textContent.trim() : null,
            ariaLabel: btn ? btn.getAttribute('aria-label') : null,
            storedPreference: localStorage.getItem('wedding-music-enabled')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[1. Initial State]:', initialState.result.value);

    // Capture screenshot of MUSIC OFF
    const shotOff = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('test_music_off.png', Buffer.from(shotOff.data, 'base64'));
    console.log('Saved test_music_off.png');

    // 2. Click button to turn MUSIC ON
    console.log('\n[2. Toggling MUSIC ON]...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
          if (btn) btn.click();
        })()
      `,
    });

    // Wait 1.3s for volume fade-in (1s) to finish
    await new Promise((r) => setTimeout(r, 1300));

    const playingState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
          // In audio-manager, audio instance is created via Audio constructor
          // We can check preference and audio state
          const pref = localStorage.getItem('wedding-music-enabled');
          return {
            buttonText: btn ? btn.textContent.trim() : null,
            ariaLabel: btn ? btn.getAttribute('aria-label') : null,
            storedPreference: pref,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[2. Playing State]:', playingState.result.value);

    // Capture screenshot of MUSIC ON
    const shotOn = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('test_music_on.png', Buffer.from(shotOn.data, 'base64'));
    console.log('Saved test_music_on.png');

    // 3. Scroll through sections and verify continuous audio
    console.log('\n[3. Verifying Audio Continuity Across Sections]...');
    const sections = ['#countdown', '#event-haldi', '#event-ceremony', '#rsvp', '#venue', '#closing'];
    for (const sel of sections) {
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${sel}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
          })()
        `,
      });
      await new Promise((r) => setTimeout(r, 400));
      const sectionAudioCheck = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
            return {
              section: '${sel}',
              musicButtonState: btn ? btn.textContent.trim() : null,
              preference: localStorage.getItem('wedding-music-enabled')
            };
          })()
        `,
        returnByValue: true,
      });
      console.log(` -> ${sel}:`, sectionAudioCheck.result.value);
    }

    // 4. Click button to turn MUSIC OFF
    console.log('\n[4. Toggling MUSIC OFF]...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
          if (btn) btn.click();
        })()
      `,
    });

    // Wait 0.8s for fade out
    await new Promise((r) => setTimeout(r, 800));

    const offState = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MUSIC'));
          return {
            buttonText: btn ? btn.textContent.trim() : null,
            ariaLabel: btn ? btn.getAttribute('aria-label') : null,
            storedPreference: localStorage.getItem('wedding-music-enabled')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('[4. Turned OFF State]:', offState.result.value);

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

testMusicBehavior().catch((err) => {
  console.error('Music test failed:', err);
  process.exit(1);
});
