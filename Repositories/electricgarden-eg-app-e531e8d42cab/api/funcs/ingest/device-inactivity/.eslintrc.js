const path = require('path');

module.exports = {
  extends: ['../../../eslint-common'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["*.js", "out/*"],
};
