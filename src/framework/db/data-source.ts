import { DataSource } from 'typeorm';

export function createDataSource(config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  charset?: string;
  synchronize?: boolean;
  logging?: boolean;
  entities?: string[];
  migrations?: string[];
  extra?: Record<string, unknown>;
}): DataSource {
  return new DataSource({
    type: 'mysql',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    charset: config.charset ?? 'utf8mb4',
    synchronize: config.synchronize ?? false,
    logging: config.logging ?? false,
    entities: config.entities,
    migrations: config.migrations,
    extra: {
      connectionLimit: 20,
      connectTimeout: 10000,
      ...config.extra,
    },
  });
}
