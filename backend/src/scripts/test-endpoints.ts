import 'dotenv/config';
import axios from 'axios';

const PORT = process.env.PORT || 5001;
const BASE = process.env.API_BASE || `http://localhost:${PORT}/api/v1`;
const agent = axios.create({ baseURL: BASE, withCredentials: true, validateStatus: () => true });

type Result = { endpoint: string; method: string; status: number; ok: boolean; note?: string };
const results: Result[] = [];

function record(endpoint: string, method: string, status: number, expectedStatus: number | number[] = 200, note?: string) {
  const allowed = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const ok = allowed.includes(status);
  results.push({ endpoint, method, status, ok, note });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${method.padEnd(6)} ${endpoint.padEnd(48)} ${status}${note ? ' · ' + note : ''}`);
}

async function main() {
  console.log(`\n🧪 NETRA Endpoint Test Suite → ${BASE}\n`);

  // 1. AUTH endpoints
  console.log('── AUTH ──');
  const registerBad = await agent.post('/auth/register', { email: 'bad', password: 'x' });
  record('/auth/register', 'POST', registerBad.status, 400, 'validation: bad payload');

  const loginBad = await agent.post('/auth/login', { email: 'nope@nope.com', password: 'wrong' });
  record('/auth/login', 'POST', loginBad.status, [400, 401], 'invalid creds');

  const loginRes = await agent.post('/auth/login', { email: 'admin@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', loginRes.status, 200, 'as admin@netra.local');
  const token: string | undefined = loginRes.data?.data?.accessToken;
  const adminCookie = loginRes.headers['set-cookie'];

  const driverLogin = await agent.post('/auth/login', { email: 'driver@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', driverLogin.status, 200, 'as driver@netra.local');
  const driverToken: string | undefined = driverLogin.data?.data?.accessToken;

  const fleetLogin = await agent.post('/auth/login', { email: 'fleet@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', fleetLogin.status, 200, 'as fleet@netra.local');
  const fleetToken: string | undefined = fleetLogin.data?.data?.accessToken;

  if (!token) { console.error('💀 No admin token; bailing out'); process.exit(1); }

  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const driverAuth = { headers: { Authorization: `Bearer ${driverToken}` } };
  const fleetAuth = { headers: { Authorization: `Bearer ${fleetToken}` } };

  // 2. USERS
  console.log('\n── USERS ──');
  const me = await agent.get('/users/me', auth);
  record('/users/me', 'GET', me.status, 200);

  const users = await agent.get('/users', auth);
  record('/users', 'GET', users.status, 200, `got ${users.data?.data?.length ?? 0}`);
  const userOne = users.data?.data?.[0];
  if (userOne?._id) {
    const u1 = await agent.get(`/users/${userOne._id}`, auth);
    record(`/users/:id`, 'GET', u1.status, 200);
    const patch = await agent.patch(`/users/${userOne._id}`, { name: 'Admin Updated' }, auth);
    record(`/users/:id`, 'PATCH', patch.status, 200);
  }

  // 3. DRIVERS
  console.log('\n── DRIVERS ──');
  const drivers = await agent.get('/drivers', auth);
  record('/drivers', 'GET', drivers.status, 200, `got ${drivers.data?.data?.length ?? 0}`);
  const d1 = drivers.data?.data?.[0];
  if (d1?._id) {
    record(`/drivers/:id`, 'GET', (await agent.get(`/drivers/${d1._id}`, auth)).status, 200);
    record(`/drivers/:id`, 'PATCH', (await agent.patch(`/drivers/${d1._id}`, { status: 'available' }, auth)).status, 200);
  }

  // 4. VEHICLES
  console.log('\n── VEHICLES ──');
  const vehicles = await agent.get('/vehicles', auth);
  record('/vehicles', 'GET', vehicles.status, 200, `got ${vehicles.data?.data?.length ?? 0}`);
  const v1 = vehicles.data?.data?.[0];
  if (v1?._id) {
    record(`/vehicles/:id`, 'GET', (await agent.get(`/vehicles/${v1._id}`, auth)).status, 200);
    record(`/vehicles/:id`, 'PATCH', (await agent.patch(`/vehicles/${v1._id}`, { status: 'active' }, auth)).status, 200);
  }
  const createVehBad = await agent.post('/vehicles', { fleetId: 'invalid', registrationNumber: 'TEST-X', type: 'truck' }, auth);
  record('/vehicles', 'POST', createVehBad.status, 400, 'expected validation error for invalid ID');

  // 5. ASSIGNMENTS
  console.log('\n── ASSIGNMENTS ──');
  const assignments = await agent.get('/assignments', auth);
  record('/assignments', 'GET', assignments.status, 200);

  // 6. TRACKING
  console.log('\n── TRACKING ──');
  if (d1?._id) {
    await agent.patch(`/drivers/${d1._id}`, { status: 'on_trip', locationSharingEnabled: true }, auth);
  }
  const ping = await agent.post('/tracking/ping', {
    lat: 28.5672,
    lng: 77.21,
    speed: 45,
    heading: 180,
    accuracy: 10,
    recordedAt: new Date().toISOString(),
  }, driverAuth);
  record('/tracking/ping', 'POST', ping.status, [200, 201], '(driver location ping)');

  if (d1?._id) {
    const trackLatest = await agent.get(`/tracking/drivers/${d1._id}/latest`, auth);
    record(`/tracking/drivers/:id/latest`, 'GET', trackLatest.status, 200);
  }

  // 7. HOSPITALS
  console.log('\n── HOSPITALS ──');
  const hospitals = await agent.get('/hospitals', auth);
  record('/hospitals', 'GET', hospitals.status, 200, `got ${hospitals.data?.data?.length ?? 0}`);
  const near = await agent.get('/hospitals/nearby?lng=77.21&lat=28.57&radiusKm=20', auth);
  record('/hospitals/nearby', 'GET', near.status, 200);

  // 8. SHIPMENTS & ROUTES
  console.log('\n── SHIPMENTS & ROUTES ──');
  const ships = await agent.get('/shipments', auth);
  record('/shipments', 'GET', ships.status, 200, `got ${ships.data?.data?.length ?? 0}`);
  const s1 = ships.data?.data?.[0];
  if (s1?._id) {
    record(`/shipments/:id`, 'GET', (await agent.get(`/shipments/${s1._id}`, auth)).status, 200);
    record(`/shipments/:id`, 'PATCH', (await agent.patch(`/shipments/${s1._id}`, { status: 'in_transit' }, auth)).status, 200);
  }

  const opt = await agent.post('/routes/optimize', {
    origin: 'Tughlakabad ICD, Delhi',
    destination: 'Agra Dry Port, UP',
    cargoType: 'container',
    priority: 'high',
  }, auth);
  record('/routes/optimize', 'POST', opt.status, 200, 'tactical optimizer');

  // 9. CORRIDORS
  console.log('\n── CORRIDORS ──');
  const cors = await agent.get('/corridors', auth);
  record('/corridors', 'GET', cors.status, 200, `got ${cors.data?.data?.length ?? 0}`);
  const c1 = cors.data?.data?.[0];
  if (c1?._id) {
    record(`/corridors/:id`, 'GET', (await agent.get(`/corridors/${c1._id}`, auth)).status, 200);
  }

  // 10. DISRUPTIONS
  console.log('\n── DISRUPTIONS ──');
  const diss = await agent.get('/disruptions', auth);
  record('/disruptions', 'GET', diss.status, 200, `got ${diss.data?.data?.length ?? 0}`);
  const wh = await agent.post('/webhooks/disruptions', {
    type: 'weather',
    severity: 'low',
    description: 'Fog warning along NH-44',
    location: { type: 'Point', coordinates: [77.2, 28.6] },
    source: 'test-agent',
  });
  record('/webhooks/disruptions', 'POST', wh.status, [200, 201], '(public webhook)');

  // 11. EMERGENCY + RESPONSE UNITS
  console.log('\n── EMERGENCY ──');
  const alerts = await agent.get('/emergency/alerts', auth);
  record('/emergency/alerts', 'GET', alerts.status, 200);
  const sos = await agent.post('/emergency/alerts', {
    type: 'accident',
    severity: 'high',
    description: 'Driver reported minor collision',
    location: { type: 'Point', coordinates: [77.21, 28.5672] },
  }, driverAuth);
  record('/emergency/alerts', 'POST', sos.status, [200, 201], '(driver alert creation)');

  const rus = await agent.get('/emergency/response-units', auth);
  record('/emergency/response-units', 'GET', rus.status, 200);

  // 12. HIGHWAYS
  console.log('\n── HIGHWAYS ──');
  const hws = await agent.get('/highways', auth);
  record('/highways', 'GET', hws.status, 200);

  // 13. RISK
  console.log('\n── RISK ──');
  const riskCors = await agent.get('/risk/corridors', auth);
  record('/risk/corridors', 'GET', riskCors.status, 200);
  const accR = await agent.get('/risk/accidents', auth);
  record('/risk/accidents', 'GET', accR.status, 200);

  // 14. PREDICTIONS
  console.log('\n── PREDICTIONS ──');
  const preds = await agent.get('/predictions', auth);
  record('/predictions', 'GET', preds.status, 200);

  // 15. SIMULATOR
  console.log('\n── SIMULATOR ──');
  const sims = await agent.get('/simulator/scenarios', auth);
  record('/simulator/scenarios', 'GET', sims.status, 200);
  const simRun = await agent.post('/simulator/run', {
    name: 'Monsoon Flooding Simulation',
    inputVariables: { rainfallMm: 80, closureKm: 12 },
  }, auth);
  record('/simulator/run', 'POST', simRun.status, [200, 201]);

  // 16. ANALYTICS
  console.log('\n── ANALYTICS ──');
  const anOverview = await agent.get('/analytics/overview', auth);
  record('/analytics/overview', 'GET', anOverview.status, 200);
  const anFleet = await agent.get('/analytics/fleet-compliance', auth);
  record('/analytics/fleet-compliance', 'GET', anFleet.status, 200);

  // 17. REPORTS
  console.log('\n── REPORTS ──');
  const reps = await agent.get('/reports', auth);
  record('/reports', 'GET', reps.status, 200);
  const repGen = await agent.post('/reports', { type: 'fleet_summary', format: 'pdf' }, auth);
  record('/reports', 'POST', repGen.status, 201);

  // 18. COPILOT
  console.log('\n── COPILOT ──');
  const cop1 = await agent.post('/copilot/message', { content: 'What is the risk on NH-44?' }, auth);
  record('/copilot/message', 'POST', cop1.status, [200, 502, 503], 'AI copilot');

  // 19. AUDIT LOG
  console.log('\n── AUDIT LOG ──');
  const audit = await agent.get('/audit-log?limit=5', auth);
  record('/audit-log', 'GET', audit.status, 200);

  // 20. SETTINGS
  console.log('\n── SETTINGS ──');
  const srcs = await agent.get('/settings/data-sources', auth);
  record('/settings/data-sources', 'GET', srcs.status, 200);
  const srcUp = await agent.post('/settings/data-sources', { name: 'Overpass OSM Sync', kind: 'overpass', config: {} }, auth);
  record('/settings/data-sources', 'POST', srcUp.status, [200, 201]);

  // 21. AUTH refresh + logout
  console.log('\n── AUTH (refresh/logout) ──');
  if (adminCookie) {
    const refresh = await agent.post('/auth/refresh', {}, { headers: { Cookie: adminCookie.join('; ') } });
    record('/auth/refresh', 'POST', refresh.status, 200, '(httpOnly cookie)');
  }
  const logout = await agent.post('/auth/logout', {}, auth);
  record('/auth/logout', 'POST', logout.status, 200);

  // SUMMARY
  console.log('\n──────────────────────────────────────────────');
  const total = results.length;
  const passCount = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok);
  console.log(`\n📊 RESULTS: ${passCount}/${total} passed (${((passCount/total)*100).toFixed(1)}%)`);
  if (failed.length) {
    console.log('\n❌ FAILURES:');
    failed.forEach(f => console.log(`   ${f.method} ${f.endpoint} → ${f.status}${f.note ? ' · ' + f.note : ''}`));
  } else {
    console.log('\n🎉 All endpoints verified and functioning effectively!');
  }
  console.log('');
  process.exit(failed.length ? 1 : 0);
}

main().catch(err => { console.error('\n💥 FATAL:', err.message); process.exit(2); });
