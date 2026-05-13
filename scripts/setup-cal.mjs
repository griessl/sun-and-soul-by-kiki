#!/usr/bin/env node
// Cal.com EU Setup für Sun & Soul by Kiki
// Idempotent: Re-run ist safe — existierende Event-Types/Schedules werden geupdated.
//
// Run: node --env-file=.env scripts/setup-cal.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteSettings = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'content', 'settings', 'site.json'), 'utf-8')
);

const API = process.env.CAL_API_BASE || 'https://api.cal.eu/v2';
const KEY = process.env.CAL_API_KEY;
const USERNAME = process.env.CAL_USERNAME || siteSettings.calUsername || 'by-kiki';
const STUDIO_ADDRESS = siteSettings.studioAddress;

if (!KEY) {
  console.error('❌ CAL_API_KEY fehlt in .env');
  process.exit(1);
}
if (!STUDIO_ADDRESS) {
  console.error('❌ studioAddress fehlt in src/content/settings/site.json');
  process.exit(1);
}

const headers = (version) => ({
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  'cal-api-version': version,
});

async function call(method, path, body, version) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: headers(version),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    console.error(`❌ ${method} ${path} → ${res.status}`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`Cal API error: ${res.status}`);
  }
  return data;
}

// ============================================================
// 1. SCHEDULES — Online (Fern) vs. Vor-Ort (Berlin)
// ============================================================
// Online: Di-Fr, erster Slot 11:00, letzter Start 19:00 (60min → endet 20:00)
// Vor-Ort: Di-Fr wie oben + Sa (letzter Start 16:00 → endet 17:30, 90min Session)
const onlineSchedule = {
  name: 'Online-Verfügbarkeit (Fern-Reiki)',
  timeZone: 'Europe/Berlin',
  availability: [
    {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '11:00',
      endTime: '20:00',
    },
    {
      days: ['Saturday'],
      startTime: '11:00',
      endTime: '17:00', // letzter Start 16:00 (60min Session)
    },
  ],
  isDefault: true,
};
const inPersonSchedule = {
  name: 'Vor-Ort-Verfügbarkeit (Berlin)',
  timeZone: 'Europe/Berlin',
  availability: [
    {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '11:00',
      endTime: '20:30',
    },
    {
      days: ['Saturday'],
      startTime: '11:00',
      endTime: '17:30',
    },
  ],
  isDefault: false,
};

console.log('→ Schedules abgleichen...');
const schedules = await call('GET', '/schedules', null, '2024-06-11');
const byName = new Map(schedules.data.map(s => [s.name, s]));

// Default-Schedule auf "Online" updaten (re-use ID 45435)
const defaultSched = schedules.data.find(s => s.isDefault) || schedules.data[0];
await call('PATCH', `/schedules/${defaultSched.id}`, onlineSchedule, '2024-06-11');
console.log(`  ✓ Schedule "${onlineSchedule.name}" (id ${defaultSched.id}) — Di-Fr 11:00-20:00`);

// In-Person-Schedule: existing patchen oder neu anlegen
let inPersonId;
const existingInPerson = schedules.data.find(s => s.name === inPersonSchedule.name);
if (existingInPerson) {
  await call('PATCH', `/schedules/${existingInPerson.id}`, inPersonSchedule, '2024-06-11');
  inPersonId = existingInPerson.id;
  console.log(`  ✓ Schedule "${inPersonSchedule.name}" (id ${inPersonId}) updated`);
} else {
  const created = await call('POST', '/schedules', inPersonSchedule, '2024-06-11');
  inPersonId = created.data.id;
  console.log(`  ✓ Schedule "${inPersonSchedule.name}" (id ${inPersonId}) created`);
}

// ============================================================
// 2. EVENT TYPES
// ============================================================
// Beide: 1h Puffer nach Session, max 2/Tag pro Typ
// Fern-Reiki: cal-video, sofort bestätigt, default schedule
// Berlin: attendeeAddress, REQUIRES CONFIRMATION (Anfrage an Kiki), in-person schedule
const eventTypes = [
  {
    title: 'Fern-Reiki Session',
    slug: 'fern-reiki',
    lengthInMinutes: 60,
    description:
`45 min. Reiki-Behandlung & 15 min. Beratung · 85,00 €

Energiearbeit ist nicht an die Grenzen von Zeit und Raum gebunden. Wir treffen uns per Video für ein kurzes Kennenlernen, du machst es dir an deinem Platz bequem, und ich sende dir Reiki über die Distanz. Im Anschluss bekommst du eine Rückmeldung zu meinen Eindrücken.`,
    locations: [{ type: 'integration', integration: 'cal-video' }],
    bookingLimitsCount: { day: 2 },
    minimumBookingNotice: 1440, // 24h
    beforeEventBuffer: 0,
    afterEventBuffer: 60, // 1h Puffer
    scheduleId: defaultSched.id,
    confirmationPolicy: { disabled: true }, // sofort bestätigt
    disableGuests: true, // "Weitere Gäste" Feld ausblenden
  },
  {
    title: 'Reiki Session — Berlin Schöneberg',
    slug: 'reiki-berlin',
    lengthInMinutes: 90,
    description:
`60 min. Reiki-Behandlung & 30 min. Beratung · 100,00 €

15 min. Vorgespräch zum Kennenlernen, 60 min. Reiki-Behandlung (du liegst bekleidet auf der Behandlungsliege), 15 min. Nachgespräch über deine Erfahrungen. In Berlin Schöneberg.

Hinweis: Vor-Ort-Termine sind zunächst eine Anfrage. Kiki bestätigt deinen Wunschtermin innerhalb von 48 h per E-Mail.`,
    locations: [{
      type: 'address',
      address: STUDIO_ADDRESS,
      public: false, // Adresse erst nach Kikis Bestätigung sichtbar
    }],
    bookingLimitsCount: { day: 2 },
    minimumBookingNotice: 1440,
    beforeEventBuffer: 0,
    afterEventBuffer: 60,
    scheduleId: inPersonId,
    confirmationPolicy: { type: 'always' }, // ← Anfrage, Kiki bestätigt manuell
    disableGuests: true,
  },
];

console.log('\n→ Event Types abgleichen...');
const existing = await call('GET', `/event-types?username=${USERNAME}`, null, '2024-06-14');
const bySlug = new Map(existing.data.map(et => [et.slug, et]));

for (const et of eventTypes) {
  const found = bySlug.get(et.slug);
  if (found) {
    await call('PATCH', `/event-types/${found.id}`, et, '2024-06-14');
    console.log(`  ✓ Updated: ${et.title}  (id ${found.id})`);
  } else {
    const created = await call('POST', '/event-types', et, '2024-06-14');
    console.log(`  ✓ Created: ${et.title}  (id ${created.data.id})`);
  }
}

console.log('\n✓ Cal.com Setup fertig.');
console.log('  • Online:  Di-Fr 11-20 + Sa 11-17 (letzter Slot Di-Fr 19:00 / Sa 16:00, 60min)');
console.log('  • Vor-Ort: Di-Fr 11-20:30 + Sa 11-17:30 (letzter Slot Sa 16:00, 90min)');
console.log('  • 1h Puffer nach jeder Session');
console.log('  • Berlin = Anfrage → Kiki bestätigt per Mail an by-kiki@gmx.de');
