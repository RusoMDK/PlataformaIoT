describe('Cerrar sesion en Plataforma IoT Unificada' , () => {

   const userCredentials = {
    email: 'carlosasantana@76gmail.com',
    password: '123456789carlosA'
  }
   beforeEach(() =>{
    cy.visit('/')
    cy.get('.btn-primary').click()
    cy.get(':nth-child(1) > .form-input-md').type(userCredentials.email)
    cy.get(':nth-child(2) > .form-input-md').type(userCredentials.password)
      // Interceptar la llamada para ver el error
    cy.intercept('POST', 'https://localhost:4443/api/auth/login').as('loginRequest')
    cy.get('.space-y-4 > .inline-flex').click()
  
      // Esperar y examinar la respuesta
    cy.wait('@loginRequest').then((interception) => {
      console.log('Login response:', interception.response)
    
   })
    cy.url().should('include', '/home') 
})
 it('login exitoso con credenciales válidas', () => {    
   cy.get('.p-3 > .px-3').click()
   cy.url().should('include', '/login') 

  })
})