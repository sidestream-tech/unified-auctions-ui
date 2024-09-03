const colors = require('tailwindcss/colors');
/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
    important: 'body',
    theme: {
        extend: {
            colors: {
                gray: colors.trueGray,
                primary: {
                    light: '#c2b5ff',
                    DEFAULT: '#9988F5',
                    dark: '#6a54e6',
                },
                dark: {
                    DEFAULT: '#1a142a',
                    light: '#2c2440',
                    dark: '#0f0a17',
                },
                orange: colors.orange,
                banner: {
                    red: '#b30000',
                },
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ['active', 'disabled'],
            cursor: ['disabled'],
            opacity: ['dark'],
            invert: ['dark'],
            margin: ['dark'],
        },
    },
    purge: {
        // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
        enabled: process.env.NODE_ENV === 'production',
        content: ['components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'plugins/**/*.js', 'nuxt.config.js'],
    },
    darkMode: 'class',
};
