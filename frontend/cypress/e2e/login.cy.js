/// <reference types="cypress" />

describe('Fluxo de Login', () => {
  it('deve permitir que um usuário com credenciais válidas faça login com sucesso', () => {
    // 1. Visitar a página de login
    // O Cypress irá automaticamente procurar a baseUrl no arquivo de configuração.
    // Vamos assumir que a rota de login é '/login'
    cy.visit('/login');

    // 2. Encontrar o campo de e-mail e digitar o e-mail de teste
    // Usaremos seletores de dados (data-cy) para tornar os testes mais robustos.
    // Precisaremos adicionar `data-cy="email-input"` ao nosso componente de input.
    cy.get('[data-cy="email-input"]').type('teste@teste.com');

    // 3. Encontrar o campo de senha e digitar a senha
    // Precisaremos adicionar `data-cy="password-input"` ao nosso componente de input.
    cy.get('[data-cy="password-input"]').type('teste123');

    // 4. Encontrar o botão de login e clicar nele
    // Precisaremos adicionar `data-cy="login-button"` ao nosso botão.
    cy.get('[data-cy="login-button"]').click();

    // 5. Verificar se o login foi bem-sucedido
    // Após o login, o usuário deve ser redirecionado para o dashboard.
    // Vamos verificar se a URL mudou para '/dashboard'.
    cy.url().should('include', '/dashboard');

    // 6. Verificar se um elemento do dashboard está visível
    // Para ter certeza de que a página carregou, vamos procurar por um título.
    // Por exemplo, o título "Dashboard".
    cy.contains('h4', 'Dashboard').should('be.visible');
  });

  it('deve exibir uma mensagem de erro para credenciais inválidas', () => {
    cy.visit('/login');

    cy.get('[data-cy="email-input"]').type('usuario@errado.com');
    cy.get('[data-cy="password-input"]').type('senhaerrada');
    cy.get('[data-cy="login-button"]').click();

    // Vamos assumir que uma mensagem de erro com o seletor `data-cy="error-message"`
    // será exibida na tela.
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Credenciais inválidas');

    // A URL não deve mudar.
    cy.url().should('not.include', '/dashboard');
  });
});
