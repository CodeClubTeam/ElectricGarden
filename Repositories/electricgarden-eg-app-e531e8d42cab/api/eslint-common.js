module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    'prefer-const': 'warn',
    'no-empty': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    camelcase: 2,
    // make these errors once code cleaned up
    '@typescript-eslint/no-use-before-define': 'warn',
    'no-var': 'warn',
    'linebreak-style': 'off',
  },
};
