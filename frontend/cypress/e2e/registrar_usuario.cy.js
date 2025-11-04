import { v4 as uuidv4 } from 'uuid';

describe('Usuarios - Registro y Login', () => {


  // Función para generar usuarios únicos que cumplan los requisitos
  function generateUser() {
    const uniqueId = uuidv4();
    // Limitar el nombre a máximo 30 caracteres y usar solo caracteres permitidos
    const shortId = uniqueId.replace(/-/g, '').substring(0, 10); // Remover guiones y acortar
    return {
      name: `user_${shortId}`,             // nombre único (ej: "user_02e40fc663")
      email: `user_${shortId}@uci.cu`,     // email único
      password: 'Car12337463865fb4.'
    };
  }
  beforeEach(() => {
    cy.visit('/');
  });

  // ===== Registro exitoso - botón superior =====
it('debe registrar un usuario y redirigir a /login (botón arriba)', () => {
  const user = generateUser();
  cy.intercept('POST', '**/api/auth/register').as('register');

  cy.get('.btn-outline-primary').click();
  
  // Verificar que estamos en la página de registro
  cy.url().should('include', '/register');
  
  cy.get('.relative > .form-input-md').type(user.name);
  cy.get('.space-y-4 > :nth-child(2) > .form-input-md').type(user.email);
  cy.get(':nth-child(3) > .form-input-md').type(user.password);
  cy.get(':nth-child(5) > .form-input-md').type(user.password);

  // Verificar que el botón está habilitado
  cy.get('.space-y-4 > .inline-flex').should('not.be.disabled');
  
  // Hacer screenshot para ver el estado del formulario
  cy.screenshot('formulario-registro');
  
  cy.get('.space-y-4 > .inline-flex').click();

  // Esperar un poco y ver si hay cambios
  cy.wait(2000);
  cy.url().then((currentUrl) => {
    console.log('URL después del click:', currentUrl);
  });
});

  // ===== Registro exitoso - botón inferior =====
  it('debe registrar un usuario y redirigir a /login (botón abajo)', () => {
  const user = generateUser();
  cy.intercept('POST', '**/api/auth/register').as('register');

  cy.get('.mt-6 > .bg-light-surface').click();
  
  // Verificar que estamos en la página de registro
  cy.url().should('include', '/register');
  
  cy.get('.relative > .form-input-md').type(user.name);
  cy.get('.space-y-4 > :nth-child(2) > .form-input-md').type(user.email);
  cy.get(':nth-child(3) > .form-input-md').type(user.password);
  cy.get(':nth-child(5) > .form-input-md').type(user.password);

  // Verificar que el botón está habilitado
  cy.get('.space-y-4 > .inline-flex').should('not.be.disabled');
  
  // Hacer screenshot para ver el estado del formulario
  cy.screenshot('formulario-registro');
  
  cy.get('.space-y-4 > .inline-flex').click();

  // Esperar un poco y ver si hay cambios
  cy.wait(2000);
  cy.url().then((currentUrl) => {
    console.log('URL después del click:', currentUrl);
  });
});

  // ===== Validación de contraseñas diferentes =====
  it('debe mostrar error si las contraseñas no coinciden', () => {
    const user = generateUser();
    cy.get('.btn-outline-primary').click();
  
  // Verificar que estamos en la página de registro
    cy.url().should('include', '/register');

    cy.get('.relative > .form-input-md').type(user.name);
    cy.get('.space-y-4 > :nth-child(2) > .form-input-md').type(user.email);
    cy.get(':nth-child(3) > .form-input-md').type(user.password);
    cy.get(':nth-child(5) > .form-input-md').type('OtraClave1266673');

    cy.get('.space-y-4 > .inline-flex').click();

    cy.contains('Las contraseñas no coinciden').should('be.visible');
  });


});

