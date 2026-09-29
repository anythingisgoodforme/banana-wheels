module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/games', '<rootDir>/public'],
  collectCoverageFrom: [
    'games/banana-wheels-gt/src/**/*.js',
    'public/bassline-rookie/src/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
  ],
  testMatch: ['**/tests/**/?(*.)+(spec|test).js'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
