module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.\\./.*(?:src|test)/.*)$': '$1.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          target: 'ES2021',
          module: 'CommonJS',
          moduleResolution: 'node',
          strict: false,
          noImplicitAny: false,
          esModuleInterop: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          strictPropertyInitialization: false,
          lib: ['ES2021'],
          types: ['jest', 'node'],
          ignoreDeprecations: '6.0',
          noEmit: true,
          allowJs: true,
        },
      },
    ],
  },
};
