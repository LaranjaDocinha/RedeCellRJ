describe('Kanban Board E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000'); // Assumindo que o app React roda na porta 3000
  });

  it('should display the Kanban board', () => {
    cy.contains('A Fazer').should('be.visible');
    cy.contains('Em Andamento').should('be.visible');
    cy.contains('Concluído').should('be.visible');
  });

  it('should add a new column', () => {
    cy.get('.add-column-button').click();
    cy.contains('Nova Coluna').should('be.visible');
  });

  it('should add a new card to a column', () => {
    cy.get('.kanban-add-card-input').first().type('New E2E Card');
    cy.get('.kanban-add-card-button').first().click();
    cy.contains('New E2E Card').should('be.visible');
  });

  // Testes de drag-and-drop são mais complexos e exigem bibliotecas adicionais ou simulação de eventos de baixo nível
  // Exemplo conceitual (requer cypress-real-events ou simulação manual):
  // it('should drag a card to another column', () => {
  //   cy.contains('Test Card 1')
  //     .trigger('mousedown', { which: 1 })
  //     .trigger('mousemove', { clientX: 500, clientY: 200 })
  //     .trigger('mouseup', { force: true });
  //   cy.contains('Test Card 1').parents('.kanban-column-container').contains('Em Andamento');
  // });
});
