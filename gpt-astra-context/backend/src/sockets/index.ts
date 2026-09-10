import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccess } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import {
  setAlertEmitter,
  setMapEmitter,
  setRiskEmitter,
  setTrackingEmitter,
} from './emitter.js';

export function attachSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGINS.split(','), credentials: true },
  });

  const guard = async (socket: { handshake: { auth?: { token?: string }; headers: { authorization?: string } } }, next: (err?: Error) => void) => {
    try {
      const header = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!header) throw new Error('no token');
      verifyAccess(header);
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  };

  const mapNs = io.of('/map');
  const alertsNs = io.of('/alerts');
  const riskNs = io.of('/risk');
  const trackingNs = io.of('/tracking');

  for (const ns of [mapNs, alertsNs, riskNs, trackingNs]) {
    ns.use(guard);
  }

  trackingNs.on('connection', (socket) => {
    const fleetId = socket.handshake.auth?.fleetId as string | undefined;
    const driverId = socket.handshake.auth?.driverId as string | undefined;
    if (fleetId) void socket.join(`fleet:${fleetId}`);
    if (driverId) void socket.join(`driver:${driverId}`);
    void socket.join('network');
  });

  mapNs.on('connection', (socket) => {
    void socket.join('network');
  });
  alertsNs.on('connection', (socket) => {
    void socket.join('network');
  });
  riskNs.on('connection', (socket) => {
    void socket.join('network');
  });

  setTrackingEmitter((event, payload) => {
    const p = payload as { fleetId?: string; driverId?: string };
    if (p.fleetId) trackingNs.to(`fleet:${p.fleetId}`).emit(event, payload);
    if (p.driverId) trackingNs.to(`driver:${p.driverId}`).emit(event, payload);
    trackingNs.to('network').emit(event, payload);
  });
  setMapEmitter((event, payload) => mapNs.to('network').emit(event, payload));
  setAlertEmitter((event, payload) => alertsNs.to('network').emit(event, payload));
  setRiskEmitter((event, payload) => riskNs.to('network').emit(event, payload));

  logger.info('Socket.io namespaces ready');
  return io;
}
