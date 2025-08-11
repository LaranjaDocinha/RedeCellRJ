# Plano de Ação: Solucionar Erros na Página de Perfil de Usuário

## Resumo dos Erros

A página de perfil do usuário está apresentando múltiplos erros ao carregar os dados:

1.  **Erro 500 (Internal Server Error)** na rota `GET /api/settings/chart_theme`.
2.  **Erro 403 (Forbidden)** na rota `GET /api/users/1/activity-logs`.
3.  **Erro 403 (Forbidden)** na rota `GET /api/users/1/login-history`.
4.  **Erro 403 (Forbidden)** na rota `GET /api/users/profile/me`.

## Estratégia de Investigação

### 1. Corrigir o Erro 500 em `chart_theme` (Prioridade Alta)

-   **Objetivo:** Identificar e corrigir a causa do erro no servidor ao buscar o tema do gráfico.
-   **Passos:**
    1.  Localizar o controlador e a rota responsáveis por `/api/settings/chart_theme`.
        -   Prováveis arquivos: `backend/routes/settingsRoutes.js` e `backend/controllers/settingsController.js`.
    2.  Analisar o código do controlador para entender a lógica de busca.
    3.  Verificar a interação com o banco de dados e as tabelas/colunas envolvidas.
    4.  Propor e aplicar a correção.

### 2. Corrigir o Erro 403 em `/users/profile/me` (Prioridade Crítica)

-   **Objetivo:** Garantir que um usuário logado possa acessar seus próprios dados de perfil. Este é um bug crítico de autorização.
-   **Passos:**
    1.  Analisar o middleware de autenticação e autorização: `backend/middleware/authMiddleware.js`.
    2.  Verificar como o token do usuário é decodificado e como as permissões são verificadas.
    3.  Inspecionar a definição da rota `GET /users/profile/me` (provavelmente em `backend/routes/userRoutes.js`) para ver qual middleware está sendo aplicado.
    4.  Corrigir a lógica no middleware ou na rota para permitir que o usuário acesse seu próprio perfil sem necessitar de permissões de 'admin'.

### 3. Analisar os Erros 403 em `activity-logs` e `login-history` (Prioridade Média)

-   **Objetivo:** Entender por que o acesso está sendo negado e se o comportamento está correto.
-   **Passos:**
    1.  Confirmar que as rotas `GET /users/:id/activity-logs` e `GET /users/:id/login-history` estão intencionalmente protegidas para administradores.
    2.  Analisar o `authMiddleware.js` e as respectivas rotas em `userRoutes.js` para ver a implementação da verificação de permissão (`'admin'`).
    3.  Se a restrição for intencional, a correção será no frontend (`frontend/src/pages/UserProfilePage.jsx`), para que essas informações só sejam buscadas se o usuário logado for um administrador.
    4.  Se a restrição *não* for intencional (por exemplo, um usuário deveria poder ver seu próprio histórico), a correção será no backend.

## Próximos Passos

Começarei pela investigação do **Erro 500**, pois pode ser uma falha mais simples e direta de resolver no backend. Em seguida, abordarei o **Erro 403 crítico** no perfil do usuário.
