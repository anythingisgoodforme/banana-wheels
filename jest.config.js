module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  transform: {},
  testPathIgnorePatterns: ['/node_modules/', '/public/'],
};
