const base = require('@backstage/cli/config/eslint-factory').createConfigForRole(
  __dirname,
  'backend-plugin-module',
);

module.exports = {
  ...base,
  ignorePatterns: [
    ...(base.ignorePatterns || []),
    'site/',
    'dist/',
    'dist-types/',
    'coverage/',
  ],
};
