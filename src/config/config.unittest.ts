import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        database: 'nexus_teammate_test',
        synchronize: true,
        logging: false,
      },
    },
  },
} as MidwayConfig;
