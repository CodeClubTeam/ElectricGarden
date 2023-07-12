const tsPreset = require('ts-jest/jest-preset');
const mongodbPreset = require('@shelf/jest-mongodb/jest-preset');

module.exports = {
  displayName: 'eg-core',
  ...tsPreset,
  ...mongodbPreset,
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
  ],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  testPathIgnorePatterns: ['/node_modules/', '/helpers/'],
  setupFilesAfterEnv: ['jest-extended', '<rootDir>/src/setupTests.js'],
};
