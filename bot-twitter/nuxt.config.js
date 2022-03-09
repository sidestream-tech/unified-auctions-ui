export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'server',

    server: {
        port: 3001,
    },

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv',
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
    ],

    serverMiddleware: ['~/src/index.ts'],
};
