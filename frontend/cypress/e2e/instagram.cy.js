describe('Instagram App Page', () => {
  it('should display the Instagram page content', () => {
    cy.visit('/apps/instagram');
    cy.contains('Página do Instagram').should('be.visible');
  });
});
