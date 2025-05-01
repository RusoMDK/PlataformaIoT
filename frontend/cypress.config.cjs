// cypress.config.cjs
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,               // graba vídeo de toda la suite
    screenshotOnRunFailure: true,
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // aquí tus event listeners si los necesitas
    },
  },
})
