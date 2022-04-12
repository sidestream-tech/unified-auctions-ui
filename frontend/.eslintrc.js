module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    plugins: ['prettier'],
    extends: [
        '@nuxtjs/eslint-config-typescript',
        'prettier/vue',
        'plugin:nuxt/recommended',
        'plugin:prettier/recommended',
        '@vue/typescript',
    ],
    globals: {
        process: 'readonly',
    },
    parserOptions: {
        project: ['tsconfig.json', 'jsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    rules: {
        'prettier/prettier': 'warn',
        'prefer-const': ['warn'],
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'vue/component-tags-order': [
            'warn',
            {
                order: ['template', 'script', 'style'],
            },
        ],
        curly: 'warn',
        'no-undef': 'off',
        'eol-last': ['error', 'always'],
        '@typescript-eslint/no-floating-promises': ['error'],
        'vue/block-lang': [
            'error',
            {
                script: {
                    lang: 'ts',
                },
            },
        ],
    },
};
