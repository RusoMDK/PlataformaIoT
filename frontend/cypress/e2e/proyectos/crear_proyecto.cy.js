describe('Crear proyectos de forma confiable', () => {

  const generateUniqueName = (prefix) => `${prefix}-${Date.now()}`

  beforeEach(() => {
    cy.visit('/')

    // Login
    cy.get('.btn-primary:visible').click()
    cy.get(':nth-child(1) > .form-input-md').type('carlosasantana@76gmail.com')
    cy.get(':nth-child(2) > .form-input-md').type('123456789carlosA')

    cy.intercept('POST', '**/api/auth/login').as('loginRequest')
    cy.get('.space-y-4 > .inline-flex:visible').click()
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    // Navegar a proyectos
    cy.get('[href="/proyectos"]:visible').click()
    cy.url().should('include', '/proyectos')
  })

  it('Crear un proyecto dinámico sin depender de la API de sensores', () => {
    const projectName = generateUniqueName('Proyecto')
    const projectDescription = `Descripción de ${projectName}`

    // Interceptar POST a sensores y simular éxito
    cy.intercept('POST', '**/api/sensores', {
      statusCode: 201,
      body: { id: 1, nombre: 'ADXL354', tipo: 'humedad' }
    }).as('crearSensor')

    // Abrir formulario
    cy.get('.bg-primary:visible').first().click()

    // Nombre y descripción del proyecto
    cy.get('[placeholder="Ej: Sistema de riego automático"]').type(projectName)
    cy.get('.form-input-md, .form-textarea').last().type(projectDescription, { force: true })

    // Agregar sensor
    cy.contains('Agregar sensor').click()
    cy.get('input[placeholder*="Buscar sensor"]').type('ADXL354')
    cy.get('.cursor-pointer:visible').first().click({ force: true })
    cy.get('input[placeholder*="Tipo"]').type('humedad', { force: true })
    cy.get('input[placeholder*="Unidad"]').type('23', { force: true })
    cy.get('input[placeholder*="Pin"]').type('1321', { force: true })

    // Crear Thing
    cy.contains('Crear Thing').first().click()
    cy.wait('@crearSensor') // espera simulada

    // Validación de proyecto creado
    cy.contains(projectName, { timeout: 5000 }).should('exist')
    cy.contains(projectDescription).should('exist')

    cy.log(`✅ Proyecto "${projectName}" creado exitosamente con sensor ADXL354 (mocked)`)
  })
})
