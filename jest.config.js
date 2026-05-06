module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
};
