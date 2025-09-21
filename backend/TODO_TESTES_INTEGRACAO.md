# Dívida Técnica: Otimização de Testes de Integração com PostgreSQL e Testcontainers

## Data: 18 de setembro de 2025

## Status: Pendente (Desabilitado Temporariamente)

## Descrição do Problema:
Os testes de integração do backend, que utilizam Testcontainers para provisionar um container PostgreSQL e Vitest como framework de teste, estão enfrentando problemas significativos de performance e estabilidade. A suíte de testes de integração não consegue ser executada de forma confiável e rápida, resultando em timeouts e erros de inicialização do pool de conexão do banco de dados.

## Sintomas Observados:
1.  **`Error: Hook timed out in 120000ms.`**: Os hooks `beforeAll` dos testes de integração excedem o tempo limite de 2 minutos durante a inicialização do container PostgreSQL.
2.  **`Error: Health check not healthy after 120000ms`**: O container PostgreSQL não se torna saudável dentro do tempo limite de inicialização do Testcontainers.
3.  **`Error: Port 5432/tcp not bound after 120000ms`**: A porta do PostgreSQL não é exposta ou ligada no host a tempo.
4.  **`Error: Test pool has not been initialized.`**: O pool de conexão do banco de dados (gerenciado pelo `testPool.ts`) não está disponível no momento em que os testes tentam acessá-lo, indicando um problema de ordem de execução entre o `globalSetup` do Vitest e a avaliação dos módulos de teste.

## Tentativas de Solução e Análise:
1.  **Aumento de Timeouts:**
    *   O `hookTimeout` global no `vitest.config.ts` foi aumentado para 300000ms (5 minutos).
    *   O `withStartupTimeout` do Testcontainers foi aumentado para 300000ms (5 minutos).
    *   **Resultado:** Embora tenha evitado alguns timeouts genéricos, os erros específicos de "Health check not healthy" e "Port not bound" persistiram, indicando que o problema é na inicialização do container, não apenas no tempo de espera do Vitest.
2.  **Centralização do Setup do Banco de Dados:**
    *   A lógica de inicialização do container PostgreSQL e aplicação de migrações foi movida para um `globalSetup` (`vitest.globalSetup.ts`), para que o container seja iniciado apenas uma vez para toda a suíte de testes de integração.
    *   **Resultado:** Isso é uma boa prática, mas expôs o problema de timing com o pool de conexão.
3.  **Gerenciamento do Pool de Teste (`testPool.ts`):**
    *   Foi criado um módulo `testPool.ts` para gerenciar o pool de conexão do banco de dados de teste, com funções `getTestPool()` e `setTestPool()`.
    *   **Resultado:** Ajudou a isolar o pool, mas não resolveu o problema de quando `getTestPool()` é chamado.
4.  **Mocking do Módulo `db`:**
    *   Tentou-se mockar o módulo `backend/src/db/index.ts` para redirecionar as chamadas para o `testPool` gerenciado pelo `globalSetup`.
    *   **Tentativa 1 (vi.mock no globalSetup):** Falhou com "Vitest failed to access its internal state" devido a `vi` não estar disponível no contexto do `globalSetup`.
    *   **Tentativa 2 (vi.mock em setupDbMock.ts):** O `vi.mock` foi movido para um `setupFile` (`setupDbMock.ts`) que é executado antes de cada teste.
    *   **Resultado:** O erro "Test pool has not been initialized." persistiu, indicando que o `db/index.ts` (ou algum serviço que o importa) está sendo avaliado *antes* mesmo do `setupDbMock.ts` ou do `globalSetup` ter a chance de inicializar o pool.

## Causas Prováveis da Lentidão e Falha:
*   **Recursos do Docker Desktop/WSL2:** A alocação de CPU e RAM para a VM do WSL2 pode ser insuficiente para a inicialização rápida do container PostgreSQL.
*   **Performance de I/O:** Embora WSL2 tenha melhorado, a performance de I/O entre o Windows e o sistema de arquivos Linux do WSL2 ainda pode ser um gargalo, especialmente para operações de banco de dados.
*   **Ordem de Carregamento de Módulos no Vitest:** O Vitest carrega os módulos de teste e suas dependências de forma que o `db/index.ts` (ou seus consumidores) é importado antes que o pool de teste possa ser inicializado pelo `globalSetup` ou `setupFiles`.

## Próximos Passos (Dívida Técnica):
1.  **Otimização do Ambiente Docker/WSL2:**
    *   Verificar e ajustar as configurações de recursos do Docker Desktop (CPU, RAM) para a VM do WSL2.
    *   Considerar mover o diretório do projeto para o sistema de arquivos do WSL2 (ex: `/home/user/RedecellRJ`) para otimizar a performance de I/O.
    *   Limpar imagens e volumes Docker não utilizados (`docker system prune`).
2.  **Investigação Aprofundada da Ordem de Carregamento:**
    *   Pesquisar mais a fundo sobre como o Vitest/Node.js lida com a ordem de importação de módulos e mocks em setups globais, especialmente quando há dependências circulares ou importações antecipadas.
    *   Explorar alternativas de mocking de módulos que permitam um controle mais granular sobre quando o mock é "ativado" ou inicializado.
3.  **Considerar Ferramentas Alternativas:**
    *   Se a lentidão persistir, avaliar outras ferramentas para testes de integração de banco de dados (ex: `pg-mem` para testes em memória, embora menos realista).
4.  **Testes de Integração Seletivos:**
    *   Manter a configuração atual do `vitest.config.ts` que executa apenas os testes unitários, garantindo que a suíte de testes passe completamente para o desenvolvimento diário.
    *   Executar os testes de integração apenas em ambientes de CI/CD ou sob demanda, com timeouts mais longos.

## Configuração Atual do `vitest.config.ts` (para referência):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setupVitestEnv.ts', './tests/setupDbMock.ts'],
    globalSetup: './tests/vitest.globalSetup.ts',
    include: ['tests/unit/**/*.test.ts'], // Atualmente, apenas testes unitários são incluídos
    deps: {
      optimizer: {
        ssr: {
          include: ['express-validator'],
        },
      },
    },
    transformMode: {
      ssr: ['express-validator'],
      web: ['express-validator'],
    },
    hookTimeout: 300000,
    alias: {
      '../src/db': './tests/__mocks__/db.ts',
    },
  },
  optimizeDeps: {
    include: ['express-validator'],
  },
});
```