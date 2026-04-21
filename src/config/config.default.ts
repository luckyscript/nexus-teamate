import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: 'nexus-teammate-default-key',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USERNAME || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'nexus_teammate',
        synchronize: false,
        logging: false,
        entities: [],
        charset: 'utf8mb4',
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    },
  },
  redis: {
    client: {
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'nexus-teammate-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  queue: {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
    },
  },
  modelProviders: {
    default: {
      provider: process.env.MODEL_PROVIDER || 'openai',
      apiKey: process.env.MODEL_API_KEY || '',
      baseURL: process.env.MODEL_BASE_URL || '',
    },
  },
  sse: {
    heartbeatInterval: 30000,
    maxConnections: 1000,
  },
} as MidwayConfig;
