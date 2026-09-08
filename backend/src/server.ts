import { createServer } from 'node:http';
import { env } from './config/env.js';
import { initSentry } from './instrument.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';
import { startCron } from './services/cron.service.js';
import { attachSockets } from './sockets/index.js';
import { logger } from './utils/logger.js';

initSentry();

async function main() {
  await connectDb();
  const app = createApp();
  const server = createServer(app);
  attachSockets(server);
  startCron();
  server.listen(env.PORT, () => {
    logger.info(`NETRA API listening on ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error('Fatal startup error', { err });
  process.exit(1);
});
