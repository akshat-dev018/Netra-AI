import cron from 'node-cron';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { UserLocationPing } from '../modules/tracking/userLocationPing.model.js';
import { Driver } from '../modules/drivers/driver.model.js';
import { emitTracking } from '../sockets/emitter.js';
import { scoreCorridors } from './riskScoring.service.js';
import { refreshPredictions } from './prediction.service.js';
import { tickSimulationFeed } from './simulationFeed.service.js';
import { trustedOp } from '../utils/trustedQuery.js';

export function startCron(): void {
  cron.schedule('*/2 * * * *', () => {
    void tickSimulationFeed().catch((err) => logger.error('simulation tick failed', { err }));
  });

  cron.schedule('*/5 * * * *', () => {
    void (async () => {
      await scoreCorridors();
      await refreshPredictions();
    })().catch((err) => logger.error('risk cron failed', { err }));
  });

  cron.schedule('*/1 * * * *', () => {
    void (async () => {
      const cutoff = new Date(Date.now() - env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000);
      const stale = await Driver.find({
        isDeleted: false,
        status: 'on_trip',
        lastPingAt: trustedOp({ $lt: cutoff }),
      });
      for (const d of stale) {
        emitTracking('driver:offline', { driverId: String(d._id), fleetId: String(d.fleetId), lastPingAt: d.lastPingAt });
      }
      const retain = new Date(Date.now() - env.LOCATION_RAW_RETENTION_HOURS * 60 * 60 * 1000);
      await UserLocationPing.deleteMany({ recordedAt: trustedOp({ $lt: retain }) });
    })().catch((err) => logger.error('tracking cron failed', { err }));
  });

  logger.info('Cron jobs started');
}
