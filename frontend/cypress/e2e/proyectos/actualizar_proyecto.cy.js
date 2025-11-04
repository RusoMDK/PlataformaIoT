// cypress/e2e/proyectos/crear_proyecto.cy.js
describe('Crear proyectos de forma confiable', () => {
  const generateUniqueName = (prefix) => `${prefix}-${Date.now()}`

  // Datos de usuario mock
  const fakeToken = 'fake-jwt-token-123'
  const fakeUser = {
    id: 1,
    nombre: 'Carlos Santana',
    email: 'carlosasantana@76gmail.com'
  }

  beforeEach(() => {
    // -------------------------
    // Intercepts para login y profile (evitan 401s y redirecciones inesperadas)
    // -------------------------
    // Interceptar POST login (form submit)
    cy.intercept('POST', '**/api/auth/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          token: fakeToken,
          user: fakeUser
        }
      })
    }).as('loginRequest')

    // Interceptar GET perfil (cuando la app pida perfil)
    cy.intercept('GET', '**/api/auth/perfil', {
      statusCode: 200,
      body: fakeUser
    }).as('perfilRequest')

    // Interceptar cualquier llamada que pida jwt-token (si tu app la usa)
    cy.intercept('GET', '**/api/auth/jwt-token', {
      statusCode: 200,
      body: { token: fakeToken }
    }).as('jwtToken')

    // Interceptar notificaciones para evitar 401s
    cy.intercept('GET', '**/api/notificaciones/**', {
      statusCode: 200,
      body: { unread: 0 }
    }).as('notificaciones')

    // -------------------------
    // Visitar la app y abrir login
    // -------------------------
    cy.visit('/') // usa baseUrl de cypress.config si lo tienes

    // Click en botón que abre el login (selector robusto)
    // Preferible: usar data-cy en tu proyecto, ejemplo: cy.get('[data-cy=btn-login]').click()
    cy.get('.btn-primary:visible').should('be.visible').click()

    // Asegurar que se redirigió a /login
    cy.url({ timeout: 5000 }).should('include', '/login')

    // -------------------------
    // Rellenar formulario de login (esperando que los inputs no estén disabled)
    // -------------------------
    // Recomendado: usa selectores semánticos (name, placeholder) en vez de nth-child
    cy.get('input[name="email"], input[type="email"], [placeholder*="email"], [placeholder*="tu@email.com"]')
      .first()
      .should('be.visible')
      .should('not.be.disabled')
      .clear()
      .type('carlosasantana@76gmail.com', { delay: 10 })

    cy.get('input[name="password"], input[type="password"], [placeholder*="contraseña"], [placeholder*="Password"]')
      .first()
      .should('be.visible')
      .should('not.be.disabled')
      .clear()
      .type('123456789carlosA', { delay: 8 })

    // Click en submit/login
    // Preferible: data-cy submit; si no, usa el selector que corresponda
    cy.get('button[type="submit"], .space-y-4 > .inline-flex:visible')
      .first()
      .should('be.visible')
      .click()

    // Esperar la llamada de login y verificar que devolvió 200
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    // Asegurar que la app pidió perfil y/o jwt-token y que ya existen en localStorage
    cy.wait('@perfilRequest')
    cy.wait('@jwtToken')

    // La app probablemente guarda el token; si no lo hace, forzamos guardarlo para continuar
    cy.window().then((win) => {
      // sólo lo guardamos si no hay token ya
      if (!win.localStorage.getItem('token')) {
        win.localStorage.setItem('token', fakeToken)
      }
    })

    // Ir a proyectos
    // Recomendado: usar [href="/proyectos"] o un data-cy
    cy.get('[href="/proyectos"], a[href*="proyectos"]').first().should('be.visible').click()
    cy.url().should('include', '/proyectos')
  })

  it('Crear un proyecto dinámico sin depender de la API de sensores', () => {
    const projectName = generateUniqueName('Proyecto')
    const projectDescription = `Descripción de ${projectName}`

    // Interceptar POST a sensores y devolver simulación exitosa
    cy.intercept('POST', '**/api/sensores', {
      statusCode: 201,
      body: { id: 1, nombre: 'ADXL354', tipo: 'humedad' }
    }).as('crearSensor')

    // Abrir formulario de crear proyecto (asegurar botón visible)
    cy.get('.bg-primary:visible, button[data-cy="btn-nuevo-proyecto"]').first().should('be.visible').click()

    // Nombre y descripción - asegurar que inputs estén visibles y habilitados
    cy.get('[placeholder="Ej: Sistema de riego automático"], input[name="nombre"], [data-cy="input-nombre"]')
      .first()
      .should('be.visible')
      .should('not.be.disabled')
      .clear()
      .type(projectName)

    cy.get('textarea[name="descripcion"], .form-textarea, [data-cy="textarea-descripcion"]')
      .last()
      .should('be.visible')
      .should('not.be.disabled')
      .clear()
      .type(projectDescription, { force: false })

    // Agregar sensor (usar texto visible)
    cy.contains('Agregar sensor', { matchCase: false }).should('be.visible').click()

    // Buscar sensor y seleccionar (esperar que la lista aparezca)
    cy.get('input[placeholder*="Buscar sensor"], input[name="buscarSensor"], [data-cy="input-buscar-sensor"]')
      .should('be.visible')
      .type('ADXL354', { delay: 10 })

    // seleccionar opción (asegurar elemento clickable)
    cy.get('.cursor-pointer:visible, .opcion-sensor:visible')
      .first()
      .should('be.visible')
      .click({ force: true })

    // Rellenar tipo, unidad, pin
    cy.get('input[placeholder*="Tipo"]').should('be.visible').type('humedad', { delay: 8 })
    cy.get('input[placeholder*="Unidad"]').should('be.visible').type('23', { delay: 8 })
    cy.get('input[placeholder*="Pin"]').should('be.visible').type('1321', { delay: 8 })

    // Crear Thing (botón)
    cy.contains('Crear Thing').first().should('be.visible').click()

    // Esperar el mock de creación del sensor
    cy.wait('@crearSensor').its('response.statusCode').should('eq', 201)

    // Validación de proyecto creado: buscar nombre y descripción en la UI
    cy.contains(projectName, { timeout: 7000 }).should('exist')
    cy.contains(projectDescription).should('exist')

    cy.log(`✅ Proyecto "${projectName}" creado exitosamente con sensor ADXL354 (mocked)`)
  })
})
