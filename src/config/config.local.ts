import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        logging: true,
        synchronize: true,
      },
    },
  },
} as MidwayConfig;
