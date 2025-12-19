describe('Diagnostic Wizard E2E Tests', () => {
  beforeEach(() => {
    // Assuming the diagnostic wizard is accessible at /diagnostics
    cy.visit('/diagnostics');
    // Mock API calls for diagnostic nodes, options, feedback, and history
    cy.intercept('GET', '/api/diagnostics/root', {
      statusCode: 200,
      body: [{ id: 'root1', question_text: 'Is the device turning on?', is_solution: false, solution_details: null, parent_node_id: null }],
    }).as('getRootNodes');

    cy.intercept('GET', '/api/diagnostics/root1/options', {
      statusCode: 200,
      body: [{ id: 'opt1', diagnostic_node_id: 'root1', option_text: 'Yes', next_node_id: 'child1' }],
    }).as('getRootOptions');

    cy.intercept('GET', '/api/diagnostics/child1', {
      statusCode: 200,
      body: { id: 'child1', question_text: 'Does the screen light up?', is_solution: false, solution_details: null, parent_node_id: 'root1' },
    }).as('getChildNode');

    cy.intercept('GET', '/api/diagnostics/child1/options', {
      statusCode: 200,
      body: [{ id: 'opt2', diagnostic_node_id: 'child1', option_text: 'Yes', next_node_id: 'solution1' }],
    }).as('getChildOptions');

    cy.intercept('GET', '/api/diagnostics/solution1', {
      statusCode: 200,
      body: { id: 'solution1', question_text: 'Solution', is_solution: true, solution_details: 'Replace the screen.', parent_node_id: 'child1' },
    }).as('getSolutionNode');

    cy.intercept('POST', '/api/diagnostics/history', { statusCode: 201, body: { message: 'History recorded' } }).as('recordHistory');
    cy.intercept('POST', '/api/diagnostics/feedback', { statusCode: 201, body: { message: 'Feedback submitted' } }).as('submitFeedback');
  });

  it('should display the diagnostic wizard title and initial question', () => {
    cy.wait('@getRootNodes');
    cy.contains('Diagnóstico Guiado').should('be.visible');
    cy.contains('Is the device turning on?').should('be.visible');
  });

  it('should navigate through the diagnostic flow and display a solution', () => {
    cy.wait('@getRootNodes');
    cy.wait('@getRootOptions');

    // Click on the first option
    cy.contains('Yes').click();
    cy.wait('@recordHistory'); // History for option click
    cy.wait('@getChildNode');
    cy.wait('@getChildOptions');

    // Verify breadcrumbs
    cy.contains('Início').should('be.visible');
    cy.contains('Is the device turning on?').should('be.visible');
    cy.contains('Does the screen light up?').should('be.visible');

    // Click on the next option leading to a solution
    cy.contains('Yes').click();
    cy.wait('@recordHistory'); // History for option click
    cy.wait('@getSolutionNode');

    // Verify solution is displayed
    cy.contains('Solução: Replace the screen.').should('be.visible');
  });

  it('should allow going back to the previous step', () => {
    cy.wait('@getRootNodes');
    cy.wait('@getRootOptions');

    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getChildNode');
    cy.wait('@getChildOptions');

    cy.contains('Voltar').click();
    cy.wait('@recordHistory'); // History for going back

    cy.contains('Is the device turning on?').should('be.visible');
    cy.contains('Yes').should('be.visible');
  });

  it('should allow restarting the diagnostic', () => {
    cy.wait('@getRootNodes');
    cy.wait('@getRootOptions');

    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getChildNode');
    cy.wait('@getChildOptions');

    cy.contains('Reiniciar Diagnóstico').click();
    cy.wait('@recordHistory'); // History for restart

    cy.contains('Is the device turning on?').should('be.visible');
    cy.contains('Yes').should('be.visible');
    cy.contains('Does the screen light up?').should('not.exist'); // Should be back at root
  });

  it('should allow submitting feedback for a solution', () => {
    cy.wait('@getRootNodes');
    cy.wait('@getRootOptions');
    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getChildNode');
    cy.wait('@getChildOptions');
    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getSolutionNode');

    cy.contains('Solução: Replace the screen.').should('be.visible');
    cy.contains('Foi útil?').should('be.visible');

    cy.contains('Sim').click();
    cy.get('textarea[aria-label="Comentários (opcional)"]').type('This was very helpful!');
    cy.contains('Enviar Feedback').click();
    cy.wait('@submitFeedback').its('request.body').should('deep.include', {
      nodeId: 'solution1',
      isHelpful: true,
      comments: 'This was very helpful!',
    });
    cy.contains('Feedback enviado com sucesso').should('be.visible');
  });

  it('should allow initiating chat/ticket', () => {
    cy.wait('@getRootNodes');
    cy.wait('@getRootOptions');
    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getChildNode');
    cy.wait('@getChildOptions');
    cy.contains('Yes').click();
    cy.wait('@recordHistory');
    cy.wait('@getSolutionNode');

    cy.contains('Iniciar Chat / Criar Ticket').click();
    cy.contains('Chat de suporte iniciado / Ticket criado.').should('be.visible');
  });
});
