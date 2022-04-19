module.exports = {
    parserOptions: {
        project: ['tsconfig.json', 'jsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    rules: {
        '@typescript-eslint/no-floating-promises': ['error'],
    },
};
