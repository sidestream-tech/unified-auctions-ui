module.exports = {
    verbose: true,
    moduleNameMapper: {
        '.*\\.(jpg|ico|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga|css|less)$': '<rootDir>/jest.file-mock.js',
        '^@/(.*)$': '<rootDir>/$1',
        '^~/(.*)$': '<rootDir>/$1',
        '^vue$': 'vue/dist/vue.common.js',
    },
    moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.svg$': '<rootDir>/jest.svg-loader.js',
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.js$': 'babel-jest',
        '.*\\.(vue)$': 'vue-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!vue-cryptoicon/)'],
    collectCoverage: false,
    collectCoverageFrom: ['<rootDir>/**/*.(vue|js)'],
    forceExit: !!process.env.CI,
};
