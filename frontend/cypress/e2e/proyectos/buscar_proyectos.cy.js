describe('Gestión de Búsqueda de Proyectos', () => {
  const userCredentials = {
    email: 'carlosasantana@76gmail.com',
    password: '123456789carlosA',
  };

  beforeEach(() => {
    cy.visit('/');

    // Iniciar sesión
    cy.get('.btn-primary', { timeout: 15000 })
      .should('be.visible')
      .click();

    cy.get(':nth-child(1) > .form-input-md', { timeout: 15000 })
      .should('be.visible')
      .type(userCredentials.email);

    cy.get(':nth-child(2) > .form-input-md')
      .should('be.visible')
      .type(userCredentials.password);

    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.get('.space-y-4 > .inline-flex').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url({ timeout: 15000 }).should('include', '/home');

    // Esperar a que aparezca el menú lateral
    cy.get('[href="/proyectos"]', { timeout: 15000 }).should('be.visible');
  });

  it('Buscar proyectos cuando existen resultados', () => {
    cy.intercept('GET', '**/api/proyectos*').as('getProyectos');

    // Entrar a la vista de proyectos
    cy.get('[href="/proyectos"]').click();
    cy.url().should('include', '/proyectos');

    // Escribir el texto a buscar
    cy.get('.form-input-md', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Sistema de siembra');

    cy.wait('@getProyectos', { timeout: 15000 }).then((interception) => {
      cy.log('Respuesta de proyectos:', interception.response?.statusCode);
    });

    // Esperar que aparezca el texto del proyecto en pantalla
    cy.contains('Sistema de siembra', { timeout: 15000 })
      .should('exist')
      .and('be.visible');
  });

  it('Buscar proyectos cuando no existen coincidencias', () => {
    cy.intercept('GET', '**/api/proyectos*').as('getProyectos');

    cy.get('[href="/proyectos"]').click();
    cy.url().should('include', '/proyectos');

    cy.get('.form-input-md').should('be.visible').clear().type('proyecto-inexistente-xyz');

    cy.wait('@getProyectos');

    cy.contains('Comienza creando un nuevo dispositivo o un Thing para verlos aquí.', {
      timeout: 10000,
    }).should('exist');
  });

  it('Buscar proyectos cuando no hay ninguno creado', () => {
    cy.get('[href="/proyectos"]').click();
    cy.url().should('include', '/proyectos');

    cy.contains('Comienza creando un nuevo dispositivo o un Thing para verlos aquí.', {
      timeout: 10000,
    }).should('exist');
  });
});
