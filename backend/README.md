# RedeCellRJ - Backend API

Este é o motor do sistema RedeCellRJ, uma API REST robusta desenvolvida para gerenciar todas as operações de negócio, processamento de dados e integrações.

## 🏗️ Arquitetura

A API foi construída com foco em **Clean Architecture** e princípios **SOLID**, garantindo que o sistema seja fácil de manter e escalar.

- **Controllers:** Responsáveis por lidar com as requisições e respostas HTTP.
- **Services:** Onde reside a lógica de negócio principal.
- **Repositories:** Camada de abstração para interação com o banco de dados (PostgreSQL).
- **Middlewares:** Tratamento de erros global, autenticação JWT, validação de entrada (Zod) e segurança.

## 🚀 Tecnologias e Ferramentas

- **Node.js & Express:** Ambiente de execução e framework web.
- **TypeScript:** Segurança de tipos em todo o fluxo de dados.
- **PostgreSQL:** Banco de dados relacional para persistência de dados críticos.
- **Redis & BullMQ:** Gerenciamento de filas para tarefas assíncronas (envio de WhatsApp, processamento de relatórios).
- **Vitest:** Suite de testes ultra-rápida para testes unitários e de integração.
- **Swagger:** Documentação interativa da API.
- **Wwebjs:** Integração avançada com WhatsApp.

## 📁 Estrutura de Pastas

```text
src/
├── controllers/   # Orquestração das rotas
├── db/            # Conexão e migrações do banco de dados
├── jobs/          # Definição de tarefas em segundo plano (Queues)
├── middlewares/   # Filtros de segurança e validação
├── repositories/  # Acesso direto aos dados (SQL)
├── routes/        # Definição dos endpoints
├── services/      # Regras de negócio complexas
├── types/         # Interfaces e tipos globais
└── utils/         # Funções utilitárias e helpers
```

## 🛠️ Comandos de Desenvolvimento

No diretório `backend`, você pode executar:

### `npm run dev`
Inicia o servidor de desenvolvimento com recarregamento automático (Hot Reload).

### `npm test`
Executa toda a suite de testes (Unitários e Integração) via Vitest.

### `npm run db:migrate`
Executa as migrações pendentes no banco de dados.

### `npm run swagger`
Gera a documentação atualizada da API.

## 🛡️ Segurança e Qualidade

- **Validação:** Todas as entradas da API são validadas rigorosamente usando Zod ou Express-Validator.
- **TDD:** Mantemos uma cobertura de testes superior a 90% para garantir estabilidade.
- **Logging:** Sistema de logs estruturado para monitoramento de erros em tempo real.
- **Sanitização:** Proteção automática contra SQL Injection e ataques comuns.

---

<p align="center">A espinha dorsal do ecossistema RedeCellRJ</p>
