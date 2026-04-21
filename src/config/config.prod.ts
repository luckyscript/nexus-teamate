import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        logging: false,
        synchronize: false,
      },
    },
  },
} as MidwayConfig;
