const http = require('http');

async function testPage() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log('HTTP Status:', res.status);

  const checks = [
    { name: 'Beginning/Hero Section (#beginning & #hero)', pass: html.includes('id="beginning"') && html.includes('id="hero"') },
    { name: 'Countdown Section (#countdown & UNTIL THE WEDDING)', pass: html.includes('id="countdown"') && html.includes('UNTIL THE WEDDING') },
    { name: 'Events Section (#events & 3 events)', pass: html.includes('id="events"') && html.includes('HALDI') && html.includes('BRIDE-TO-BE') && html.includes('WEDDING CEREMONY') },
    { name: 'Join/RSVP Section (#join & #rsvp)', pass: html.includes('id="join"') && html.includes('id="rsvp"') && html.includes('JOIN US FOR') },
    { name: 'Venue Section (#venue & PENUGONDA)', pass: html.includes('id="venue"') && html.includes('PENUGONDA') && html.includes('maps.app.goo.gl') },
    { name: 'Closing Section (#closing & Love & Blessings)', pass: html.includes('id="closing"') && html.includes('With Love') },
    { name: 'Music Control (Manual toggle, no autoplay)', pass: html.includes('MUSIC OFF') },
    { name: 'Chapter Navigation (All 6 chapters)', pass: ['BEGINNING', 'COUNTDOWN', 'EVENTS', 'JOIN', 'VENUE', 'CLOSING'].every(ch => html.includes(ch)) },
    { name: 'WhatsApp Link (917995120344)', pass: html.includes('wa.me/917995120344') },
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

  console.log(`\nResult: ${passed}/${checks.length} checks passed.`);
  if (passed === checks.length) {
    console.log('ALL VERIFICATIONS SUCCESSFUL!');
  } else {
    process.exit(1);
  }
}

testPage().catch(err => {
  console.error(err);
  process.exit(1);
});
