import { v4 as uuidv4 } from 'uuid';
import pkg from './package.json';

const PREVIEW_IMAGE = (process.env.FRONTEND_ORIGIN || '') + '/preview.jpeg';
const SITE_TITLE = 'Unified Auctions';
const SITE_DESCRIPTION = `The "${SITE_TITLE}" is the portal to all Maker Auctions related services. Easily interact with the Maker Protocol through streamlined interfaces, inform yourself about how the protocol works and receive updates on current auctions.`;
const ENABLE_FILE_PROTOCOL = process.env.ENABLE_FILE_PROTOCOL?.toLocaleLowerCase() === 'true';
const ROUTER_HISTORY_MODE = ENABLE_FILE_PROTOCOL ? 'hash' : 'history';
const ROUTER_BASE = ENABLE_FILE_PROTOCOL ? '.' : '';

export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    env: {
        SITE_TITLE,
        RPC_URL: process.env.RPC_URL,
        DEMO_MODE: process.env.DEMO_MODE || false,
        PRODUCTION_DOMAIN: process.env.PRODUCTION_DOMAIN,
        CONTACT_EMAIL: process.env.CONTACT_EMAIL || undefined,
        GITHUB_URL: pkg.repository.url,
        STAGING_BANNER_URL: process.env.STAGING_BANNER_URL || undefined,
        HEAPIO_ID: process.env.HEAPIO_ID || undefined,
        APPLICATION_VERSION: uuidv4(), // hardcoded this during build
    },

    publicRuntimeConfig: {
        TERMS_AND_CONDITIONS_URL: 'https://unified-auctions.makerdao.com/pdf/Unified-Auction-UI_Terms.Conditions.pdf',
    },

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: SITE_TITLE,
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'description', content: SITE_DESCRIPTION },
            { property: 'og:title', content: SITE_TITLE },
            { property: 'og:type', content: 'website' },
            { property: 'og:description', content: SITE_DESCRIPTION },
            { property: 'og:image', content: PREVIEW_IMAGE },
            { name: 'theme-color', content: '#1aab9b' },
            { name: 'twitter:card', content: 'app' },
            { name: 'twitter:title', content: SITE_TITLE },
            { name: 'twitter:description', content: SITE_DESCRIPTION },
            { name: 'twitter:image', content: PREVIEW_IMAGE },
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: `${ROUTER_BASE}/favicon.ico` }],
        script: [{ src: `${ROUTER_BASE}/js/HeapIO.js` }],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: ['~/plugins/vuex-persist.client.js', '~/plugins/antdesign.client.js', '~/plugins/crypto-icons.client.js'],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: false,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv',
        // https://go.nuxtjs.dev/typescript
        '@nuxt/typescript-build',
        // https://go.nuxtjs.dev/stylelint
        '@nuxtjs/stylelint-module',
        // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
        '@nuxtjs/tailwindcss',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://github.com/paulgv/nuxt-vuex-router-sync
        'nuxt-vuex-router-sync',
        // https://github.com/moritzsternemann/vue-plausible
        'vue-plausible',
    ],

    // Plausible.io Settings
    plausible: {
        domain: process.env.PRODUCTION_DOMAIN,
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        // Webpack config
        extend: config => {
            // remove svg from the standard nuxt loader
            const svgRule = config.module.rules.find(rule => rule.test.test('.svg'));
            svgRule.test = /\.(png|jpe?g|gif|webp)$/;

            // add custom vue-svg-loader loader
            config.module.rules.push({
                test: /\.svg$/,
                use: ['babel-loader', 'vue-svg-loader'],
            });
        },
        loaders: {
            less: {
                lessOptions: {
                    javascriptEnabled: true,
                },
            },
        },
    },
    // router: https://nuxtjs.org/docs/configuration-glossary/configuration-router
    router: {
        mode: ROUTER_HISTORY_MODE,
        base: ROUTER_BASE || '/',
    },
};
