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
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712',
                    DEFAULT: '#3762A0',
                },
                primary: {
                    purple: '#A273FF',
                    light: '#968cf3',
                    DEFAULT: '#4331E9',
                    dark: '#2A197D',
                },
                dark: {
                    DEFAULT: '#1a142a',
                    light: '#2c2440',
                    dark: '#0f0a17',
                },
                orange: '#f97316',
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
    content: ['components/**/*.vue', 'layouts/**/*.vue', 'pages/**/*.vue', 'plugins/**/*.js', 'nuxt.config.js'],
    darkMode: 'class',
};
