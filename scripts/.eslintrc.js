module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    plugins: ['prettier'],
    extends: ['@nuxtjs/eslint-config-typescript', 'plugin:nuxt/recommended', 'plugin:prettier/recommended'],
    globals: {
        process: 'readonly',
    },
    rules: {
        'prettier/prettier': 'warn',
        'prefer-const': ['warn'],
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        curly: 'warn',
        'no-undef': 'off',
        'eol-last': ['error', 'always'],
    },
};
