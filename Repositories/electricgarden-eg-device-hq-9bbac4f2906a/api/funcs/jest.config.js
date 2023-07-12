const tsPreset = require("ts-jest/jest-preset");

module.exports = {
  displayName: "device-hq-api",
  ...tsPreset,
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/out/"],
  testPathIgnorePatterns: ["/node_modules", "helpers"],
};
