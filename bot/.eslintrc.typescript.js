const eslintrc = require('./.eslintrc.js');

module.exports = {
    ...eslintrc,
    parserOptions: {
        project: ['tsconfig.json', 'jsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    rules: {
        ...eslintrc.rules,
        '@typescript-eslint/no-floating-promises': ['error'],
    },
};
