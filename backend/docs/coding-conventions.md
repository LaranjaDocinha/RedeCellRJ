# Convenções de Codificação do Backend

Este documento descreve as convenções de codificação a serem seguidas no desenvolvimento do backend para garantir consistência, legibilidade e manutenibilidade do código.

## 1. Convenções de Nomenclatura

### 1.1. Variáveis e Funções

*   Utilizar `camelCase`.
*   Nomes devem ser descritivos e claros.

    ```typescript
    // Bom
    const userName = 'JohnDoe';
    function calculateTotalPrice(price: number, quantity: number) { /* ... */ }

    // Ruim
    const un = 'JohnDoe';
    function calc(p, q) { /* ... */ }
    ```

### 1.2. Classes e Interfaces

*   Utilizar `PascalCase`.
*   Nomes devem ser substantivos.

    ```typescript
    // Bom
    class ProductService { /* ... */ }
    interface UserInterface { /* ... */ }

    // Ruim
    class product_service { /* ... */ }
    interface user_interface { /* ... */ }
    ```

### 1.3. Constantes

*   Utilizar `UPPER_SNAKE_CASE`.
*   Para valores que não mudam durante a execução do programa.

    ```typescript
    // Bom
    const MAX_RETRIES = 3;
    const API_BASE_URL = 'http://localhost:3000';

    // Ruim
    const maxRetries = 3;
    const apiBaseUrl = 'http://localhost:3000';
    ```

### 1.4. Arquivos e Diretórios

*   **Diretórios:** Utilizar `kebab-case`.
*   **Arquivos de Classes/Interfaces/Componentes:** Utilizar `PascalCase.ts`.
*   **Arquivos de Utilitários/Funções:** Utilizar `camelCase.ts`.

    ```
    // Estrutura de Exemplo
    src/
    ├── services/
    │   └── productService.ts
    ├── utils/
    │   └── errorHandler.ts
    ├── models/
    │   └── Product.ts
    └── routes/
        └── productRoutes.ts
    ```

## 2. Outras Convenções (a serem expandidas)

*   **Comentários:** Devem explicar o *porquê* e não o *quê*. Mantenha-os concisos e relevantes.
*   **Espaçamento:** 2 espaços para indentação (configurado via Prettier).
*   **Quebra de Linha:** Linhas com no máximo 100 caracteres (configurado via Prettier).
*   **Aspas:** Aspas simples para strings (configurado via Prettier).
