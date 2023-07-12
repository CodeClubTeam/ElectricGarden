module.exports = {
  projects: [
    '<rootDir>/funcs/http/appapi/jest.config.js',
    '<rootDir>/funcs/provisioner/jest.config.js',
    '<rootDir>/packages/core/jest.config.js',
  ],
  reporters: ['default', 'jest-junit'],
};
