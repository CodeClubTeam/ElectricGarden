const path = require('path');
const fs = require('fs');
const tsPreset = require('ts-jest/jest-preset');
const mongodbPreset = require('@shelf/jest-mongodb/jest-preset');

function getEnvFilePath(name) {
  const envPath = path.resolve(__dirname, name);
  if (!fs.existsSync(envPath) && !('CI' in process.env)) {
    console.warn(`Could not find ${name} in ${envPath}. Environment variables may not be loaded`);
  }
  return envPath;
}

require('dotenv-defaults').config({
  path: getEnvFilePath('.env'),
  defaults: getEnvFilePath('.env.defaults'),
});

module.exports = {
  displayName: 'appapi',
  ...tsPreset,
  ...mongodbPreset,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/out/'],
  testPathIgnorePatterns: ['/node_modules/', '/helpers/'],
  setupFilesAfterEnv: ['jest-extended', '<rootDir>/setupTests.js'],
};
