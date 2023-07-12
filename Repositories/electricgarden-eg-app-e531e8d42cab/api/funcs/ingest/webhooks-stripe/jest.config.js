const tsPreset = require('ts-jest/jest-preset');

module.exports = {
  displayName: 'stripe-webhooks',
  ...tsPreset,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/out/'],
  testPathIgnorePatterns: ['/node_modules'],
};
