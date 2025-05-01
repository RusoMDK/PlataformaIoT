const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    projectId: "q4pxbq",
    baseUrl: 'http://localhost:5173',  // Ajusta el puerto si tu Vite usa otro
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // aquí puedes añadir event listeners o plugins
    },
  },
});