describe('Customer Portal', () => {
  let publicToken: string;
  let serviceOrderId: number;

  before(() => {
    // 1. Create a Service Order via API as Admin to get a valid token
    cy.loginByApi();
    cy.request({
      method: 'POST',
      url: '/api/v1/service-orders',
      body: {
        customer_name: 'John Doe Cypress',
        brand: 'Apple',
        product_description: 'iPhone 13 Pro',
        issue_description: 'Tela Quebrada',
        services: [{ name: 'Troca de Tela', price: 1500 }],
        estimated_cost: 1500,
        priority: 'high',
        // Assuming public_token is generated automatically
      },
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('token')}`,
      }
    }).then((response) => {
      expect(response.status).to.eq(201); // Created
      serviceOrderId = response.body.id;
      publicToken = response.body.public_token;

      if (!publicToken) {
        // Fallback: If public_token is not returned in create, fetch it
        cy.request({
            method: 'GET',
            url: `/api/v1/service-orders/${serviceOrderId}`,
            headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` }
        }).then(res => {
            publicToken = res.body.public_token;
            expect(publicToken).to.exist;
        });
      }
    });
  });

  beforeEach(() => {
    // Ensure we are logged out to simulate a customer
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('should allow customer to track order via public token', () => {
    // 2. Visit the Portal
    cy.visit(`/portal/${publicToken}`);

    // 3. Verify content
    cy.contains('Portal do Cliente').should('be.visible');
    cy.contains('iPhone 13 Pro').should('be.visible');
    cy.contains('Aguardando Avaliação').should('be.visible');
    
    // 4. Verify no admin elements
    cy.get('nav').should('not.contain', 'Dashboard'); // Sidebar should not exist
  });

  it('should redirect to auth page if token is invalid', () => {
    cy.visit('/portal/invalid-token-123');
    // Assuming it redirects or shows 404/Error
    // If redirects to auth:
    // cy.url().should('include', '/portal/auth'); 
    // Or shows error:
    cy.contains(/Ordem de servi.o n.o encontrada|Erro|Inv.lido/i).should('exist');
  });
});
