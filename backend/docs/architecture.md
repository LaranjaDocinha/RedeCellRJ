# Arquitetura do Backend

Este documento descreve a estrutura de módulos e camadas do backend, seguindo princípios de Clean Architecture e separação de responsabilidades.

## 1. Visão Geral das Camadas

O backend é organizado em camadas distintas, cada uma com uma responsabilidade específica, promovendo modularidade, testabilidade e manutenibilidade.

*   **Camada de Apresentação (Routes/Controllers):** Responsável por receber requisições HTTP, validar dados de entrada, orquestrar chamadas aos serviços e enviar respostas HTTP.
*   **Camada de Serviço (Services):** Contém a lógica de negócio principal da aplicação. Orquestra operações entre diferentes domínios e interage com a camada de dados.
*   **Camada de Dados (Repository/Data Source - Futuro):** Responsável pela persistência e recuperação de dados. Atualmente, utiliza um array em memória, mas será substituída por um banco de dados.
*   **Camada de Middleware:** Funções que processam requisições antes de chegarem aos controladores ou após serem processadas por eles (ex: tratamento de erros, autenticação).
*   **Camada de Utilitários:** Funções e classes auxiliares que não se encaixam diretamente nas outras camadas, mas são usadas por elas (ex: classes de erro, helpers).

## 2. Estrutura de Diretórios

A estrutura de diretórios reflete as camadas arquiteturais, facilitando a localização e organização do código.

```
backend/
├── src/
│   ├── index.ts             # Ponto de entrada da aplicação, configuração do Express
│   ├── routes/              # Camada de Apresentação (Controllers)
│   │   └── products.ts      # Rotas e lógica de controle para produtos
│   ├── services/            # Camada de Serviço (Lógica de Negócio)
│   │   └── productService.ts # Lógica CRUD para produtos (interage com dados)
│   ├── middlewares/         # Camada de Middleware
│   │   └── errorMiddleware.ts # Middleware global de tratamento de erros
│   └── utils/               # Camada de Utilitários
│       └── errors.ts        # Definição de classes de erro customizadas
├── tests/                   # Testes da aplicação
│   ├── unit/                # Testes unitários (ex: productService.test.ts)
│   └── products.test.ts     # Testes de integração (rotas/controllers)
├── docs/                    # Documentação do backend
│   └── coding-conventions.md # Convenções de codificação
├── .github/                 # Configurações do GitHub (workflows de CI/CD)
├── package.json             # Dependências e scripts do projeto
├── tsconfig.json            # Configuração do TypeScript
├── jest.config.js           # Configuração do Jest
├── .eslintrc.js             # Configuração do ESLint
├── .prettierrc.js           # Configuração do Prettier
└── performance-test.yml     # Script de teste de performance (Artillery)
```

## 3. Fluxo de Requisição (Exemplo: `GET /products/:id`)

1.  **`index.ts`**: A requisição chega ao servidor Express.
2.  **`products.ts` (Route/Controller):** A rota `/:id` é acionada. O controlador extrai o `id` dos parâmetros da requisição.
3.  **`productService.ts` (Service):** O controlador chama `productService.getProductById(id)`. O serviço contém a lógica para encontrar o produto (atualmente em memória).
4.  **`products.ts` (Route/Controller):** O controlador recebe o resultado do serviço. Se o produto for encontrado, ele é enviado como resposta HTTP 200. Se não for encontrado, uma `NotFoundError` é lançada.
5.  **`errorMiddleware.ts` (Middleware):** Se uma `NotFoundError` (ou qualquer outro erro) for lançada, o `errorMiddleware` a intercepta, formata a resposta de erro padrão e a envia ao cliente.

## 4. Princípios Arquiteturais

*   **Separação de Responsabilidades:** Cada camada e módulo tem uma responsabilidade bem definida.
*   **Injeção de Dependência (Futuro):** Será implementada para desacoplar componentes e facilitar a testabilidade.
*   **Testabilidade:** A estrutura modular facilita a escrita de testes unitários e de integração.
*   **Escalabilidade:** A separação de camadas permite que partes da aplicação sejam desenvolvidas e escaladas independentemente.
