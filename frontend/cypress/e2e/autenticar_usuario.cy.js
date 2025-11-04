describe('Autenticación de Usuario', () => {
  const userCredentials = {
    email: 'carlosasantana@76gmail.com',
    password: '123456789carlosA'
  }
   beforeEach(() =>{
    cy.visit('/')
  })
  it('login exitoso con credenciales válidas', () => {    
    // Usando los selectores actuales de tu aplicación
    cy.get('.btn-primary').click()
    cy.get(':nth-child(1) > .form-input-md').type(userCredentials.email)
    cy.get(':nth-child(2) > .form-input-md').type(userCredentials.password)
      // Interceptar la llamada para ver el error
    cy.intercept('POST', 'https://localhost:4443/api/auth/login').as('loginRequest')
    cy.get('.space-y-4 > .inline-flex').click()
  
  // Esperar y examinar la respuesta
    cy.wait('@loginRequest').then((interception) => {
      console.log('Login response:', interception.response)
    // Esto te mostrará el mensaje de error del servidor
  })

    cy.url().should('include', '/home')

  })

  it('login exitoso con credenciales válidas con el botón Comenzar ahora de abajo', () => {    
    // Usando los selectores actuales de tu aplicación
    cy.get('.mt-6 > .bg-primary').click()
    cy.get(':nth-child(1) > .form-input-md').type(userCredentials.email)
    cy.get(':nth-child(2) > .form-input-md').type(userCredentials.password)
    cy.get('.space-y-4 > .inline-flex').click()

    cy.url().should('include', '/home')
  })

  it('muestra error con credenciales inválidas', () => {
    cy.get('.btn-primary').click()
    cy.get(':nth-child(1) > .form-input-md').type('invalid@email.com')
    cy.get(':nth-child(2) > .form-input-md').type('wrongpass')
    cy.get('.space-y-4 > .inline-flex').click()

    cy.contains('Credenciales inválidas').should('exist')
  })
})