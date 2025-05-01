describe('Botón “Comenzar ahora” en la página principal', function () {
  it('debería mostrar el botón y redirigir al login al hacer click', function () {
    // 1) Abre la página principal
    cy.visit('/')

    // 2) Comprueba que el botón existe, es visible y está habilitado
    cy.contains('button', 'Comenzar Ahora')
      .should('be.visible')
      .and('not.be.disabled')
   // 3) Haz click en “Comenzar ahora”
   cy.contains('button', 'Comenzar Ahora').click()

   // 4) Verifica que tras el click te redirige al login
   cy.url().should('include', '/login')

  })
})