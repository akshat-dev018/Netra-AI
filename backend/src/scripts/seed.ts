import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../modules/users/user.model.js';
import { Fleet } from '../modules/drivers/fleet.model.js';
import { Driver } from '../modules/drivers/driver.model.js';
import { Vehicle } from '../modules/vehicles/vehicle.model.js';
import { Hospital } from '../modules/hospitals/hospital.model.js';
import { Corridor } from '../modules/corridors/corridor.model.js';
import { Shipment } from '../modules/shipments/shipment.model.js';
import { Disruption } from '../modules/disruptions/disruption.model.js';
import { ResponseUnit } from '../modules/response-units/responseUnit.model.js';
import { HighwayCache } from '../modules/highways/highwayCache.model.js';
import { DataSource } from '../modules/settings/dataSource.model.js';
import { logger } from '../utils/logger.js';
import { point } from '../utils/geo.js';

const PASSWORD = 'NetraDemo123!';
const NH44: number[][] = [
  [77.209, 28.6139],
  [77.3, 28.4],
  [77.4, 28.0],
  [77.58, 27.5],
  [77.973, 27.1767],
];

export async function seedData() {
  const hash = await bcrypt.hash(PASSWORD, 12);

  const fleet = await Fleet.findOneAndUpdate(
    { name: 'NETRA North Fleet' },
    { name: 'NETRA North Fleet', region: 'NCR', isDeleted: false },
    { upsert: true, returnDocument: 'after' as const },
  );

  const roles = [
    { email: 'admin@netra.local', name: 'System Admin', role: 'admin' as const },
    { email: 'ops@netra.local', name: 'Ops Manager', role: 'ops_manager' as const },
    { email: 'controller@netra.local', name: 'Network Controller', role: 'controller' as const },
    { email: 'analyst@netra.local', name: 'Risk Analyst', role: 'analyst' as const },
    { email: 'dispatcher@netra.local', name: 'Dispatcher', role: 'dispatcher' as const },
    { email: 'fleet@netra.local', name: 'Fleet Manager', role: 'fleet_manager' as const, fleetId: fleet._id },
    { email: 'driver@netra.local', name: 'Demo Driver', role: 'driver' as const, fleetId: fleet._id },
    { email: 'viewer@netra.local', name: 'Executive Viewer', role: 'viewer' as const },
  ];

  const users: Record<string, typeof User.prototype> = {};
  for (const r of roles) {
    const u = await User.findOneAndUpdate(
      { email: r.email },
      {
        email: r.email,
        passwordHash: hash,
        name: r.name,
        role: r.role,
        fleetId: r.fleetId,
        isEmailVerified: true,
        isDeleted: false,
      },
      { upsert: true, returnDocument: 'after' as const },
    );
    users[r.role] = u;
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { registrationNumber: 'DL01AB1234' },
    {
      fleetId: fleet._id,
      registrationNumber: 'DL01AB1234',
      type: 'truck',
      capacity: 18,
      status: 'active',
      currentLocation: point(77.21, 28.5672),
      maintenanceDueAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      isDeleted: false,
    },
    { upsert: true, returnDocument: 'after' as const },
  );

  const driverUser = users.driver;
  const driver = await Driver.findOneAndUpdate(
    { userId: driverUser._id },
    {
      userId: driverUser._id,
      fleetId: fleet._id,
      licenseNumber: 'DL-2024-998877',
      licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
      phone: '+91-9800000001',
      assignedVehicleId: vehicle._id,
      status: 'available',
      lastKnownLocation: point(77.21, 28.5672),
      emergencyContact: '+91-9800000002',
      isDeleted: false,
    },
    { upsert: true, returnDocument: 'after' as const },
  );
  vehicle.assignedDriverId = driver._id;
  await vehicle.save();

  await Hospital.findOneAndUpdate(
    { name: 'AIIMS New Delhi' },
    {
      name: 'AIIMS New Delhi',
      location: point(77.21, 28.5672),
      traumaLevel: 1,
      capabilities: ['trauma', 'icu', 'helipad'],
      capacityStatus: 'available',
      contactInfo: { phone: '011-26588500', address: 'Ansari Nagar, New Delhi' },
      isDeleted: false,
    },
    { upsert: true },
  );
  await Hospital.findOneAndUpdate(
    { name: 'Safdarjung Hospital' },
    {
      name: 'Safdarjung Hospital',
      location: point(77.206, 28.568),
      traumaLevel: 1,
      capabilities: ['trauma', 'icu'],
      capacityStatus: 'limited',
      contactInfo: { phone: '011-26730000' },
      isDeleted: false,
    },
    { upsert: true },
  );
  await Hospital.findOneAndUpdate(
    { name: 'SN Medical College Agra' },
    {
      name: 'SN Medical College Agra',
      location: point(78.008, 27.176),
      traumaLevel: 2,
      capabilities: ['emergency'],
      capacityStatus: 'available',
      contactInfo: { phone: '0562-2260270' },
      isDeleted: false,
    },
    { upsert: true },
  );

  await HighwayCache.findOneAndUpdate(
    { ref: 'NH-44' },
    {
      ref: 'NH-44',
      name: 'NH-44 Delhi–Agra',
      geometry: { type: 'LineString', coordinates: NH44 },
      source: 'seed',
      syncedAt: new Date(),
    },
    { upsert: true },
  );

  const corridor44 = await Corridor.findOneAndUpdate(
    { highwayRef: 'NH-44', name: 'Delhi–Agra freight corridor' },
    {
      name: 'Delhi–Agra freight corridor',
      highwayRef: 'NH-44',
      path: { type: 'LineString', coordinates: NH44 },
      nodeStart: 'Delhi',
      nodeEnd: 'Agra',
      type: 'national',
      capacity: 80,
      currentUtilization: 42,
      riskScore: 38,
      riskComponents: { weather: 8, congestion: 12, incidents: 8, accidentDensity: 10 },
      isDeleted: false,
    },
    { upsert: true, returnDocument: 'after' as const },
  );

  const corridor48 = await Corridor.findOneAndUpdate(
    { highwayRef: 'NH-48', name: 'Delhi–Mumbai freight corridor' },
    {
      name: 'Delhi–Mumbai freight corridor',
      highwayRef: 'NH-48',
      path: { type: 'LineString', coordinates: [[77.209, 28.6139], [75.787, 26.912], [72.877, 19.076]] },
      nodeStart: 'Delhi ICD',
      nodeEnd: 'JNPT Mumbai',
      type: 'national',
      capacity: 100,
      currentUtilization: 78,
      riskScore: 68,
      riskComponents: { weather: 22, congestion: 38, incidents: 25, accidentDensity: 15 },
      isDeleted: false,
    },
    { upsert: true, returnDocument: 'after' as const },
  );

  const corridor19 = await Corridor.findOneAndUpdate(
    { highwayRef: 'NH-19', name: 'Delhi–Kolkata Grand Trunk' },
    {
      name: 'Delhi–Kolkata Grand Trunk',
      highwayRef: 'NH-19',
      path: { type: 'LineString', coordinates: [[77.209, 28.6139], [82.973, 25.317], [88.363, 22.572]] },
      nodeStart: 'Delhi Dadri',
      nodeEnd: 'Kolkata Port',
      type: 'national',
      capacity: 90,
      currentUtilization: 58,
      riskScore: 42,
      riskComponents: { weather: 10, congestion: 18, incidents: 12, accidentDensity: 14 },
      isDeleted: false,
    },
    { upsert: true, returnDocument: 'after' as const },
  );

  const seedShipments = [
    {
      reference: 'SHP-DEMO-001',
      origin: 'Tughlakabad ICD',
      destination: 'Agra Dry Port',
      carrier: 'NETRA Logistics',
      status: 'in_transit',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor44._id,
      routePolyline: NH44,
      riskScore: 38,
      eta: new Date(Date.now() + 3 * 60 * 60 * 1000),
      priority: 'high',
      cargoType: 'container',
      createdBy: users.controller._id,
      isDeleted: false,
    },
    {
      reference: 'SHP-DEMO-002',
      origin: 'Gurugram Logistics Hub',
      destination: 'Jaipur Inland Depot',
      carrier: 'North Express Freight',
      status: 'in_transit',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor48._id,
      riskScore: 72,
      eta: new Date(Date.now() + 5 * 60 * 60 * 1000),
      priority: 'high',
      cargoType: 'refrigerated',
      createdBy: users.controller._id,
      isDeleted: false,
    },
    {
      reference: 'SHP-DEMO-003',
      origin: 'Noida Cargo Terminal',
      destination: 'Mathura Refinery Hub',
      carrier: 'Apex Cargo Ltd',
      status: 'delayed',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor44._id,
      riskScore: 84,
      eta: new Date(Date.now() + 8 * 60 * 60 * 1000),
      priority: 'critical',
      cargoType: 'hazmat',
      createdBy: users.controller._id,
      isDeleted: false,
    },
    {
      reference: 'SHP-DEMO-004',
      origin: 'Delhi ICD Dadri',
      destination: 'Varanasi Ring Terminal',
      carrier: 'GT Road Transports',
      status: 'in_transit',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor19._id,
      riskScore: 45,
      eta: new Date(Date.now() + 12 * 60 * 60 * 1000),
      priority: 'medium',
      cargoType: 'bulk',
      createdBy: users.controller._id,
      isDeleted: false,
    },
    {
      reference: 'SHP-DEMO-005',
      origin: 'Kishangarh Industrial Park',
      destination: 'Ahmedabad Port',
      carrier: 'Western Logistics',
      status: 'in_transit',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor48._id,
      riskScore: 65,
      eta: new Date(Date.now() + 9 * 60 * 60 * 1000),
      priority: 'high',
      cargoType: 'container',
      createdBy: users.controller._id,
      isDeleted: false,
    },
    {
      reference: 'SHP-DEMO-006',
      origin: 'Delhi ICD',
      destination: 'JNPT Mumbai',
      carrier: 'Interstate Freight Co',
      status: 'planned',
      assignedDriverId: driver._id,
      assignedVehicleId: vehicle._id,
      currentCorridorId: corridor48._id,
      riskScore: 35,
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000),
      priority: 'low',
      cargoType: 'bulk',
      createdBy: users.controller._id,
      isDeleted: false,
    },
  ];

  for (const s of seedShipments) {
    await Shipment.findOneAndUpdate(
      { reference: s.reference },
      s,
      { upsert: true },
    );
  }

  const shipment = await Shipment.findOne({ reference: 'SHP-DEMO-001' }) || seedShipments[0];

  await Disruption.findOneAndUpdate(
    { description: 'Lane closure near Faridabad' },
    {
      type: 'road_closure',
      severity: 'medium',
      affectedCorridorIds: [corridor44._id],
      status: 'open',
      source: 'manual',
      location: point(77.32, 28.41),
      startedAt: new Date(),
      description: 'Lane closure near Faridabad',
      isDeleted: false,
    },
    { upsert: true },
  );

  await Disruption.findOneAndUpdate(
    { description: 'Monsoon Flash Flood on NH-48 KM 142' },
    {
      type: 'flooding',
      severity: 'critical',
      affectedCorridorIds: [corridor48._id],
      status: 'open',
      source: 'manual',
      location: point(75.787, 26.912),
      startedAt: new Date(),
      description: 'Monsoon Flash Flood on NH-48 KM 142',
      isDeleted: false,
    },
    { upsert: true },
  );

  await ResponseUnit.findOneAndUpdate(
    { name: 'NCR Trauma Unit 1' },
    {
      name: 'NCR Trauma Unit 1',
      type: 'ambulance',
      status: 'available',
      currentLocation: point(77.22, 28.58),
      isDeleted: false,
    },
    { upsert: true },
  );

  await DataSource.findOneAndUpdate(
    { name: 'OSM Overpass' },
    { name: 'OSM Overpass', kind: 'overpass', status: 'idle', config: {} },
    { upsert: true },
  );

  logger.info('Seed complete', {
    password: PASSWORD,
    shipment: shipment.reference,
    emails: roles.map((r) => r.email),
  });
}

async function run() {
  await connectDb();
  await seedData();
  await disconnectDb();
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
