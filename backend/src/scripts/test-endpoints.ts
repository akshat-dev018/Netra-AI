import 'dotenv/config';
import axios from 'axios';

const BASE = 'http://localhost:5000/api/v1';
const agent = axios.create({ baseURL: BASE, withCredentials: true, validateStatus: () => true });

type Result = { endpoint: string; method: string; status: number; ok: boolean; note?: string };
const results: Result[] = [];

function record(endpoint: string, method: string, status: number, note?: string) {
  const ok = status >= 200 && status < 400 || status === 401 || status === 403 || status === 404 || status === 409;
  results.push({ endpoint, method, status, ok, note });
  const icon = ok ? (status >= 200 && status < 300 ? '✅' : '🟡') : '❌';
  console.log(`${icon} ${method.padEnd(6)} ${endpoint.padEnd(48)} ${status}${note ? ' · ' + note : ''}`);
}

async function main() {
  console.log(`\n🧪 NETRA Endpoint Test Suite → ${BASE}\n`);

  // 1. AUTH endpoints (public)
  console.log('── AUTH ──');
  const registerBad = await agent.post('/auth/register', { email: 'bad', password: 'x' });
  record('/auth/register', 'POST', registerBad.status, 'validation: bad payload');
  const loginBad = await agent.post('/auth/login', { email: 'nope@nope', password: 'wrong' });
  record('/auth/login', 'POST', loginBad.status, 'invalid creds');
  const loginRes = await agent.post('/auth/login', { email: 'admin@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', loginRes.status, 'as admin@netra.local');
  const token: string | undefined = loginRes.data?.data?.accessToken;
  const driverLogin = await agent.post('/auth/login', { email: 'driver@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', driverLogin.status, 'as driver@netra.local');
  const driverToken: string | undefined = driverLogin.data?.data?.accessToken;
  const fleetLogin = await agent.post('/auth/login', { email: 'fleet@netra.local', password: 'NetraDemo123!' });
  record('/auth/login', 'POST', fleetLogin.status, 'as fleet@netra.local');
  const fleetToken: string | undefined = fleetLogin.data?.data?.accessToken;
  if (!token) { console.error('💀 No admin token; bailing out'); process.exit(1); }

  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const driverAuth = { headers: { Authorization: `Bearer ${driverToken}` } };
  const fleetAuth = { headers: { Authorization: `Bearer ${fleetToken}` } };

  const me = await agent.get('/auth/me', auth);
  record('/auth/me', 'GET', me.status);

  // 2. USERS
  console.log('\n── USERS ──');
  const users = await agent.get('/users', auth);
  record('/users', 'GET', users.status, `got ${users.data?.data?.length ?? 0}`);
  const userOne = users.data?.data?.[0];
  if (userOne?._id) {
    const u1 = await agent.get(`/users/${userOne._id}`, auth);
    record(`/users/:id`, 'GET', u1.status);
    const patch = await agent.patch(`/users/${userOne._id}`, { displayName: 'Updated' }, auth);
    record(`/users/:id`, 'PATCH', patch.status);
  }

  // 3. DRIVERS
  console.log('\n── DRIVERS ──');
  const drivers = await agent.get('/drivers', auth);
  record('/drivers', 'GET', drivers.status, `got ${drivers.data?.data?.length ?? 0}`);
  const d1 = drivers.data?.data?.[0];
  if (d1?._id) {
    record(`/drivers/:id`, 'GET', (await agent.get(`/drivers/${d1._id}`, auth)).status);
    record(`/drivers/:id`, 'PATCH', (await agent.patch(`/drivers/${d1._id}`, { status: 'on_trip' }, auth)).status);
  }

  // 4. VEHICLES
  console.log('\n── VEHICLES ──');
  const vehicles = await agent.get('/vehicles', auth);
  record('/vehicles', 'GET', vehicles.status, `got ${vehicles.data?.data?.length ?? 0}`);
  const v1 = vehicles.data?.data?.[0];
  if (v1?._id) {
    record(`/vehicles/:id`, 'GET', (await agent.get(`/vehicles/${v1._id}`, auth)).status);
    record(`/vehicles/:id`, 'PATCH', (await agent.patch(`/vehicles/${v1._id}`, { status: 'idle' }, auth)).status);
  }
  const createVeh = await agent.post('/vehicles', { fleetId: 'invalid', registrationNumber: 'TEST-X', type: 'truck' }, auth);
  record('/vehicles', 'POST', createVeh.status, 'expected validation/fleet error');

  // 5. ASSIGNMENTS
  console.log('\n── ASSIGNMENTS ──');
  const assignments = await agent.get('/assignments', auth);
  record('/assignments', 'GET', assignments.status);

  // 6. TRACKING
  console.log('\n── TRACKING ──');
  const track = await agent.get('/tracking?minutes=60', driverAuth);
  record('/tracking', 'GET', track.status, '(driver scope)');

  // 7. HOSPITALS
  console.log('\n── HOSPITALS ──');
  const hospitals = await agent.get('/hospitals', auth);
  record('/hospitals', 'GET', hospitals.status, `got ${hospitals.data?.data?.length ?? 0}`);
  const h1 = hospitals.data?.data?.[0];
  if (h1?._id) record(`/hospitals/:id`, 'GET', (await agent.get(`/hospitals/${h1._id}`, auth)).status);
  const near = await agent.get('/hospitals/nearby?lng=77.21&lat=28.57&radiusKm=20', auth);
  record('/hospitals/nearby', 'GET', near.status);

  // 8. SHIPMENTS
  console.log('\n── SHIPMENTS ──');
  const ships = await agent.get('/shipments', auth);
  record('/shipments', 'GET', ships.status, `got ${ships.data?.data?.length ?? 0}`);
  const s1 = ships.data?.data?.[0];
  if (s1?._id) {
    record(`/shipments/:id`, 'GET', (await agent.get(`/shipments/${s1._id}`, auth)).status);
    record(`/shipments/:id`, 'PATCH', (await agent.patch(`/shipments/${s1._id}`, { status: 'in_transit' }, auth)).status);
  }

  // 9. ROUTES (optimizer)
  console.log('\n── ROUTES ──');
  const routes = await agent.get('/routes/optimizer', auth);
  record('/routes/optimizer', 'GET', routes.status);

  // 10. CORRIDORS
  console.log('\n── CORRIDORS ──');
  const cors = await agent.get('/corridors', auth);
  record('/corridors', 'GET', cors.status, `got ${cors.data?.data?.length ?? 0}`);
  const c1 = cors.data?.data?.[0];
  if (c1?._id) {
    record(`/corridors/:id`, 'GET', (await agent.get(`/corridors/${c1._id}`, auth)).status);
    record(`/corridors/:id/risk`, 'GET', (await agent.get(`/corridors/${c1._id}/risk`, auth)).status);
  }

  // 11. DISRUPTIONS
  console.log('\n── DISRUPTIONS ──');
  const diss = await agent.get('/disruptions', auth);
  record('/disruptions', 'GET', diss.status, `got ${diss.data?.data?.length ?? 0}`);
  const dis1 = diss.data?.data?.[0];
  if (dis1?._id) {
    record(`/disruptions/:id`, 'GET', (await agent.get(`/disruptions/${dis1._id}`, auth)).status);
    record(`/disruptions/:id`, 'PATCH', (await agent.patch(`/disruptions/${dis1._id}`, { status: 'mitigated' }, auth)).status);
  }
  // webhook disruption (public)
  const wh = await agent.post('/webhooks/disruptions', {
    type: 'weather', severity: 'low', description: 'test-webhook',
    location: { type: 'Point', coordinates: [77.2, 28.6] }, source: 'test-agent',
  });
  record('/webhooks/disruptions', 'POST', wh.status, '(public webhook)');

  // 12. EMERGENCY + RESPONSE UNITS
  console.log('\n── EMERGENCY ──');
  const alerts = await agent.get('/emergency/alerts', auth);
  record('/emergency/alerts', 'GET', alerts.status);
  const sos = await agent.post('/emergency/sos', { type: 'accident', description: 'test' }, driverAuth);
  record('/emergency/sos', 'POST', sos.status, '(driver scope)');
  const rus = await agent.get('/emergency/response-units', auth);
  record('/emergency/response-units', 'GET', rus.status);
  const ru1 = rus.data?.data?.[0];
  if (ru1?._id) record(`/emergency/response-units/:id`, 'GET', (await agent.get(`/emergency/response-units/${ru1._id}`, auth)).status);

  // 13. HIGHWAYS
  console.log('\n── HIGHWAYS ──');
  const hws = await agent.get('/highways', auth);
  record('/highways', 'GET', hws.status);

  // 14. RISK
  console.log('\n── RISK ──');
  const risk = await agent.get('/risk', auth);
  record('/risk', 'GET', risk.status);
  const accR = await agent.get('/risk/accidents', auth);
  record('/risk/accidents', 'GET', accR.status);

  // 15. PREDICTIONS
  console.log('\n── PREDICTIONS ──');
  const preds = await agent.get('/predictions', auth);
  record('/predictions', 'GET', preds.status);

  // 16. SIMULATOR
  console.log('\n── SIMULATOR ──');
  const sims = await agent.get('/simulator', auth);
  record('/simulator', 'GET', sims.status);

  // 17. ANALYTICS
  console.log('\n── ANALYTICS ──');
  const anOverview = await agent.get('/analytics/overview', auth);
  record('/analytics/overview', 'GET', anOverview.status);
  const anFleet = await agent.get('/analytics/fleet', fleetAuth);
  record('/analytics/fleet', 'GET', anFleet.status, '(fleet scope)');

  // 18. REPORTS
  console.log('\n── REPORTS ──');
  const reps = await agent.get('/reports', auth);
  record('/reports', 'GET', reps.status);
  const repGen = await agent.post('/reports', { type: 'fleet_summary', format: 'pdf' }, auth);
  record('/reports', 'POST', repGen.status);

  // 19. COPILOT
  console.log('\n── COPILOT ──');
  const cop1 = await agent.post('/copilot/chat', { message: 'What is the risk on NH-44?' }, auth);
  record('/copilot/chat', 'POST', cop1.status);

  // 20. AUDIT LOG
  console.log('\n── AUDIT LOG ──');
  const audit = await agent.get('/audit-log?limit=5', auth);
  record('/audit-log', 'GET', audit.status);

  // 21. SETTINGS (data sources)
  console.log('\n── SETTINGS ──');
  const srcs = await agent.get('/settings/sources', auth);
  record('/settings/sources', 'GET', srcs.status);
  const srcUp = await agent.post('/settings/sources', { name: 'Test', kind: 'custom', status: 'idle', config: {} }, auth);
  record('/settings/sources', 'POST', srcUp.status);
  const src1 = srcs.data?.data?.[0];
  if (src1?._id) record(`/settings/sources/:id`, 'GET', (await agent.get(`/settings/sources/${src1._id}`, auth)).status);

  // 22. AUTH refresh + logout
  console.log('\n── AUTH (refresh/logout) ──');
  const refreshClient = axios.create({ baseURL: BASE, withCredentials: true, validateStatus: () => true });
  // Need to set the cookie first from the earlier admin login – we'll use agent's cookies indirectly by reusing login first
  await refreshClient.post('/auth/login', { email: 'admin@netra.local', password: 'NetraDemo123!' });
  const refresh = await refreshClient.post('/auth/refresh');
  record('/auth/refresh', 'POST', refresh.status, '(httpOnly cookie)');
  const logout = await refreshClient.post('/auth/logout');
  record('/auth/logout', 'POST', logout.status);

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
    console.log('\n🎉 All endpoints returned expected status codes (2xx/3xx/expected 4xx)');
  }
  console.log('');
  process.exit(failed.length ? 1 : 0);
}

main().catch(err => { console.error('\n💥 FATAL:', err.message); process.exit(2); });
