# Análise do Armazenamento de Tokens (Frontend)

Este documento analisa o método atual de armazenamento de tokens JWT no frontend e propõe uma migração para um método mais seguro.

## 1. Estado Atual

*   **Mecanismo:** Os tokens JWT (access tokens) são armazenados no `localStorage` do navegador, utilizando a biblioteca `zustand` com o middleware `persist` (`createJSONStorage(() => localStorage)`).
*   **Localização:** O token é acessível via JavaScript através do `localStorage`.

## 2. Vulnerabilidade Identificada

*   **Tipo:** Cross-Site Scripting (XSS).
*   **Descrição:** Se houver uma vulnerabilidade de XSS no aplicativo (ex: um campo de entrada que não sanitiza corretamente o HTML, permitindo a injeção de `<script>` tags), um atacante pode executar código JavaScript malicioso no navegador do usuário. Este script malicioso pode então acessar o `localStorage` e roubar o token JWT do usuário. Com o token em mãos, o atacante pode se passar pelo usuário, realizando ações em seu nome sem que ele perceba.

## 3. Solução Recomendada: Migração para HttpOnly Cookies

Para mitigar significativamente o risco de roubo de tokens via XSS, a recomendação é migrar o armazenamento do access token para `HttpOnly cookies`.

### Por que HttpOnly Cookies?

*   **Proteção contra XSS:** Cookies marcados como `HttpOnly` não podem ser acessados, lidos ou modificados por JavaScript no lado do cliente. Isso significa que, mesmo que um atacante consiga injetar um script XSS, ele não conseguirá roubar o token de autenticação.
*   **Envio Automático:** O navegador envia automaticamente os cookies `HttpOnly` com cada requisição para o domínio de origem, eliminando a necessidade de gerenciamento manual do token no JavaScript do frontend.

### Desafios e Considerações de Implementação

1.  **Backend (Servidor de Autenticação):**
    *   **Configuração:** O backend precisará ser modificado para, em vez de retornar o JWT no corpo da resposta JSON após o login, configurá-lo como um `HttpOnly cookie` na resposta HTTP.
    *   **Exemplo:** `res.cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: ... });`
    *   **CORS:** Garantir que as configurações de CORS no backend permitam o envio de credenciais (cookies) entre domínios, se o frontend e o backend estiverem em domínios diferentes.

2.  **Frontend (Aplicação React):**
    *   **Acesso ao Token:** O frontend não terá mais acesso direto ao token via JavaScript. Isso impacta qualquer lógica que dependa da leitura do token do `localStorage`.
    *   **Axios `withCredentials`:** A instância do `axios` utilizada para as requisições autenticadas precisará ser configurada para enviar cookies (`axios.defaults.withCredentials = true;`).
    *   **Tratamento de Erros:** O tratamento de erros de autenticação (401 Unauthorized) precisará ser ajustado, pois o token não estará mais disponível para inspeção no cliente.

3.  **Proteção contra CSRF (Cross-Site Request Forgery):**
    *   **Necessidade:** Ao usar cookies para autenticação, a aplicação se torna vulnerável a ataques CSRF. Um atacante pode induzir o navegador do usuário a enviar uma requisição maliciosa para o seu site, aproveitando-se da sessão autenticada.
    *   **Solução:** Implementar um mecanismo de proteção CSRF. As opções comuns incluem:
        *   **Synchronizer Token Pattern:** O servidor envia um token CSRF (diferente do JWT) para o cliente, que o inclui em cada requisição. O servidor valida esse token. (Recomendado para APIs).
        *   **Double-Submit Cookie Pattern:** O cliente envia um token CSRF em um cookie e também em um cabeçalho ou corpo da requisição. O servidor compara os dois.

4.  **Gerenciamento de Refresh Tokens:**
    *   **Adaptação:** Se um mecanismo de refresh token for implementado (para tokens de acesso de curta duração), o refresh token também deve ser armazenado de forma segura, idealmente como um `HttpOnly cookie` separado, com um tempo de expiração mais longo.

## 4. Próximos Passos

1.  **Discussão:** Discutir a viabilidade e o impacto da migração para `HttpOnly cookies` com a equipe de desenvolvimento.
2.  **Planejamento:** Elaborar um plano detalhado para as modificações no backend e frontend, incluindo a implementação de proteção CSRF.
3.  **Implementação:** Executar as mudanças de forma incremental, com testes abrangentes.
