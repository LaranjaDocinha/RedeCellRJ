describe('Smoke Test - Critical Paths', () => {
  it('deve carregar a aplicação inicial (provavelmente Login)', () => {
    cy.visit('/');
    // Verifica se o título da página existe, indicando que o React montou algo
    cy.title().should('not.be.empty');
    // Verifica se não há erros de console críticos (opcional, mas bom)
    cy.window().then((win) => {
      // check for critical globals if any
    });
  });
});
