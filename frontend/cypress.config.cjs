// cypress.config.cjs
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,               // graba vídeo de toda la suite
     videoCompression: true,
    trashAssetsBeforeRuns: true,
    screenshotOnRunFailure: true,
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // aquí tus event listeners si los necesitas
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
      baseUrl: 'https://localhost:5173',
      reporter: 'cypress-mochawesome-reporter',
      reporterOptions:{
      reportDir: 'cypress/report',
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
    },  

  }
})
   
  

  