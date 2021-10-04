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
                primary: {
                    light: '#8dd7cf',
                    DEFAULT: '#1AAB9B',
                    dark: '#169184',
                },
                dark: {
                    DEFAULT: '#111E1E',
                    light: '#12302e',
                    dark: '#081615',
                },
            },
        },
    },
    variants: {
        extend: {
            backgroundColor: ['active'],
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
