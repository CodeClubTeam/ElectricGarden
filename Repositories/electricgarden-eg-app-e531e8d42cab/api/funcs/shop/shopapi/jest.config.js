const path = require('path');
const tsPreset = require('ts-jest/jest-preset');
const mongodbPreset = require('@shelf/jest-mongodb/jest-preset');

require('dotenv-defaults').config({
  path: path.resolve(__dirname, '.env'),
  defaults: path.resolve(__dirname, '.env.defaults'),
});

module.exports = {
  displayName: 'payment',
  ...tsPreset,
  ...mongodbPreset,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/out/'],
  testPathIgnorePatterns: ['/node_modules', '/helpers/'],
  setupFilesAfterEnv: ['jest-extended'],
};
