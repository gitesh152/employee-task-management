import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

import { databaseUrl } from './env.config.js';
import logger from '../utils/logger.util.js';

const globalForPrisma = globalThis;

const buildAdapterConfig = () => {
  const parsedUrl = new URL(databaseUrl);
  const dbPort = Number.parseInt(parsedUrl.port, 10);

  const config = {
    host: parsedUrl.hostname,
    port: dbPort,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname.replace(/^\/+/, ''),
    connectionLimit: 10,
    connectTimeout: 10000,
    acquireTimeout: 30000,
  };

  if (
    parsedUrl.searchParams.get('ssl') === 'true' ||
    parsedUrl.searchParams.get('sslmode') === 'require'
  ) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

const adapterConfig = buildAdapterConfig();
const adapter = new PrismaMariaDb(adapterConfig);

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    adapter,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Test database connection
 */
export const connectDb = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ MySQL Connected');
  } catch (error) {
    logger.error('❌ MySQL connection error:', error);
    throw error;
  }

  process.on('beforeExit', async () => {
    await prisma.$disconnect();
    logger.warn('MySQL Disconnected');
  });
};

export default prisma;
