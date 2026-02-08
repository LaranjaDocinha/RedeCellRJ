describe('Fluxo Crítico: Venda no PDV', () => {
  beforeEach(() => {
    // Mock de Login
    // Idealmente usar cy.request para obter token e setar no localStorage
    // Para simplicidade, vamos usar a UI
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@pdv.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Esperar redirecionamento
    cy.url().should('include', '/dashboard');
  });

  it('Deve navegar até o PDV', () => {
    // Navegar para PDV via Menu
    cy.visit('/pos');
    
    // Verificar se carregou
    cy.contains('Modo Venda').should('exist');
    cy.contains('Carrinho').should('exist');
  });
});
