import 'cypress-mochawesome-reporter/register';
describe('Pruebas de Humo - Plataforma IoT', () => {
  it('debe cargar la página principal correctamente', () => {
    cy.visit('/')
    cy.contains('Plataforma IoT Unificada').should('be.visible')
    cy.get('body').click()

  })
 
  it('debe navegar a la página de login', () => {
    cy.visit('/')
    cy.get('.mt-6 > .bg-primary').click()
    cy.url().should('include', '/login')
  })
})