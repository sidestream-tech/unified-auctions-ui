//eslint-disable-next-line @typescript-eslint/no-var-requires
const eslintrc = require('./.eslintrc.js');

module.exports = {
    ...eslintrc,
    parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    rules: {
        ...eslintrc.rules,
        '@typescript-eslint/no-floating-promises': ['error'],
    },
};
