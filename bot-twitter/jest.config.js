module.exports = {
    verbose: true,
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^~/(.*)$': '<rootDir>/$1',
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.js$': 'babel-jest',
    },
    collectCoverage: false,
    forceExit: !!process.env.CI,
};
