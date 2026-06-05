const base = require('@backstage/cli/config/eslint-factory').createConfigForRole(
  __dirname,
  'backend-plugin-module',
);

module.exports = {
  ...base,
  // Pin the Jest version so eslint-plugin-jest's version-aware rules
  // (e.g. jest/no-deprecated-functions) don't fail with "Unable to detect
  // Jest version" when node_modules hoisting shifts after a Renovate bump.
  settings: {
    ...base.settings,
    jest: { version: 29 },
  },
  ignorePatterns: [
    ...(base.ignorePatterns || []),
    'site/',
    'dist/',
    'dist-types/',
    'coverage/',
  ],
};
