const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        video: false,
        screenshotOnRunFailure: false,
        defaultCommandTimeout: 3600000,
        supportFile: false,
    },
});
