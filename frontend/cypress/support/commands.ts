/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email?: string, password?: string): Chainable<void>;
    loginByApi(email?: string, password?: string): Chainable<void>;
  }
}

Cypress.Commands.add('login', (email = 'admin@pdv.com', password = 'admin123') => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('loginByApi', (email = 'admin@pdv.com', password = 'admin123') => {
  cy.log(`Logging in via API as ${email}`);
  cy.request({
    method: 'POST',
    url: '/api/v1/auth/login',
    body: {
      email,
      password,
      rememberMe: true,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.accessToken);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
    cy.log('Logged in via API');
  });
});
