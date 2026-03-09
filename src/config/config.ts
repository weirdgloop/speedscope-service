import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  logToken: string;
  requestSizeLimit: string;
  allowedOrigin: string;
  databaseUrl: string;
  purgeProfiles: boolean;
  purgeHourlyAggregations: boolean;
  trackAggregationMemory: boolean;
}

const logToken = process.env.LOG_TOKEN;
if (!logToken) {
  throw new Error('LOG_TOKEN must be defined!');
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be defined!');
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logToken: logToken,
  // during testing, some requests were up to 63mb large
  requestSizeLimit: process.env.REQUEST_SIZE_LIMIT || '100mb',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'https://www.speedscope.app',
  databaseUrl: databaseUrl,
  purgeProfiles: process.env.PURGE_PROFILES !== 'false',
  purgeHourlyAggregations: process.env.PURGE_HOURLY_AGGREGATIONS !== 'false',
  trackAggregationMemory: process.env.TRACK_AGGREGATION_MEMORY !== 'false',
};

export default config;
