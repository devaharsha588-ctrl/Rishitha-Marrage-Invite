const http = require('http');

async function testCompositor() {
  console.log('--- COMPOSITOR REGRESSION VERIFICATION ---\n');

  // 1. Fetch HTML from dev server
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('HTTP Status:', res.status);

  // 2. Fetch HTML with ?motionDebug=1
  const resDebug = await fetch('http://localhost:3000/?motionDebug=1');
  const htmlDebug = await resDebug.text();

  const checks = [
    {
      name: 'Canonical Scene 01 (Hero / #beginning)',
      pass: html.includes('id="beginning"') && html.includes('id="hero"'),
    },
    {
      name: 'Canonical Scene 02 (Countdown / #countdown)',
      pass: html.includes('id="countdown"') && html.includes('UNTIL THE WEDDING'),
    },
    {
      name: 'Canonical Scene 03 (Haldi / #event-haldi)',
      pass: html.includes('id="event-haldi"') && html.includes('HALDI &amp; SANGEETH'),
    },
    {
      name: 'Canonical Scene 04 (Bride-to-be / #event-pellikuthuru)',
      pass: html.includes('id="event-pellikuthuru"') && html.includes('BRIDE-TO-BE CELEBRATION') && html.includes('PELLI KUTHURU'),
    },
    {
      name: 'Canonical Scene 05 (Ceremony / #event-ceremony)',
      pass: html.includes('id="event-ceremony"') && html.includes('WEDDING CEREMONY'),
    },
    {
      name: 'Canonical Scene 06 (Join / #join & #rsvp)',
      pass: html.includes('id="join"') && html.includes('id="rsvp"'),
    },
    {
      name: 'Canonical Scene 07 (Venue / #venue & Penugonda)',
      pass: html.includes('id="venue"') && html.includes('PENUGONDA'),
    },
    {
      name: 'Canonical Scene 08 (Closing / #closing & Maroon world)',
      pass: html.includes('id="closing"') && html.includes('With Love'),
    },
    {
      name: 'Pushkarini is NOT rendered as primary scene background',
      pass: !html.includes('pushkarini.webp'),
    },
  ];

  let passed = 0;
  for (const c of checks) {
    if (c.pass) {
      console.log('✓ PASS:', c.name);
      passed++;
    } else {
      console.log('✗ FAIL:', c.name);
    }
  }

  console.log(`\nResult: ${passed}/${checks.length} compositor checks passed.`);
  if (passed === checks.length) {
    console.log('ALL COMPOSITOR VERIFICATIONS SUCCESSFUL!');
  } else {
    process.exit(1);
  }
}

testCompositor().catch((err) => {
  console.error(err);
  process.exit(1);
});
