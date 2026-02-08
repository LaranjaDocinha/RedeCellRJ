describe('Marketplace & Smart Pricing', () => {
  beforeEach(() => {
    cy.loginByApi();
  });

  it('should create a new pricing rule', () => {
    cy.visit('/smart-pricing');
    
    // Check if page loaded
    cy.contains('Smart Pricing').should('exist'); // Assuming title

    // Open Modal/Form
    cy.get('button').contains(/Nova Regra|Adicionar/i).click();

    // Fill Form
    // Assuming form fields have name attributes or labels
    cy.get('input[name="name"]').type('Promo Teste Cypress');
    cy.get('select[name="type"]').select('multiplier'); // Assuming select
    cy.get('input[name="value"]').type('0.9');
    
    // Save
    cy.get('button[type="submit"]').click();

    // Verify Success
    cy.contains('Promo Teste Cypress').should('be.visible');
  });

  it('should load marketplace page', () => {
    cy.visit('/marketplace');
    cy.contains('Marketplace Hub').should('exist');
    // Check for sync button
    cy.contains(/Sincronizar|Integrar/i).should('exist');
  });
});
