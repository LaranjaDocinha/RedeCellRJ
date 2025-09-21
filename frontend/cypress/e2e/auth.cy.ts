describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should allow a user to log in successfully', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Assuming successful login redirects to home or dashboard
    cy.url().should('include', '/');
    cy.contains('Welcome to RedecellRJ POS!').should('be.visible');
  });

  it('should display an error for invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Login failed: Invalid credentials.').should('be.visible');
    cy.url().should('include', '/login');
  });
});
