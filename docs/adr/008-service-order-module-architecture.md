# 008: Arquitetura do Módulo de Ordem de Serviço (O.S.)

**Status:** Proposto

**Data:** 2025-10-06

## Contexto

O sistema atualmente suporta vendas (PDV), gestão de produtos, clientes e inventário, mas não possui uma funcionalidade para gerenciar reparos e serviços técnicos, que é um pilar de negócio para uma loja de celulares. A necessidade é de um módulo completo que permita registrar a entrada de um aparelho para reparo, criar um laudo e orçamento, gerenciar o estoque de peças, rastrear o status do serviço e manter um histórico completo por aparelho (via IMEI).

## Decisão

Decidimos projetar e implementar um novo conjunto de entidades e serviços no backend para suportar o Módulo de Ordem de Serviço. A arquitetura será baseada em novas tabelas no banco de dados PostgreSQL e novos endpoints na API REST, seguindo os padrões já estabelecidos no projeto.

### 1. Novas Tabelas no Banco de Dados

Serão criadas as seguintes tabelas:

*   **`service_orders`**: Tabela principal que armazena a informação de cada O.S.
    *   `id` (PK)
    *   `customer_id` (FK para `customers`)
    *   `product_id` (FK para `products` - o aparelho)
    *   `imei` (varchar, indexado)
    *   `entry_checklist` (jsonb) - Armazena o estado de entrada do aparelho (riscos, botões, etc.).
    *   `issue_description` (text) - Descrição do problema pelo cliente.
    *   `technical_report` (text) - Laudo do técnico.
    *   `budget_value` (decimal) - Valor do orçamento.
    *   `status` (varchar) - Ex: 'Aguardando Avaliação', 'Aguardando Aprovação', 'Em Reparo', 'Finalizado', 'Entregue'.
    *   `created_at`, `updated_at`

*   **`service_order_items`**: Itens associados a uma O.S. (peças ou serviços).
    *   `id` (PK)
    *   `service_order_id` (FK para `service_orders`)
    *   `part_id` (FK para `parts`, opcional)
    *   `service_description` (varchar, ex: "Mão de Obra")
    *   `quantity` (integer)
    *   `unit_price` (decimal)

*   **`parts`**: Tabela para gerenciar o estoque de peças de reposição.
    *   `id` (PK)
    *   `name` (varchar)
    *   `sku` (varchar, unique)
    *   `description` (text)
    *   `stock_quantity` (integer)
    *   `cost_price` (decimal)
    *   `supplier_id` (FK para `suppliers`, opcional)

*   **`service_order_status_history`**: Log de todas as mudanças de status de uma O.S. para auditoria.
    *   `id` (PK)
    *   `service_order_id` (FK para `service_orders`)
    *   `old_status` (varchar)
    *   `new_status` (varchar)
    *   `changed_by_user_id` (FK para `users`)
    *   `created_at`

### 2. Novos Endpoints da API

Serão criadas novas rotas e controladores para gerenciar as entidades acima:

*   `POST /api/service-orders`: Abre uma nova O.S.
*   `GET /api/service-orders`: Lista todas as O.S. com filtros (por status, cliente, etc.).
*   `GET /api/service-orders/:id`: Detalhes de uma O.S. específica.
*   `PUT /api/service-orders/:id`: Atualiza uma O.S. (adiciona laudo, altera status).
*   `POST /api/service-orders/:id/items`: Adiciona um item (peça/serviço) a uma O.S.
*   `DELETE /api/service-orders/:id/items/:itemId`: Remove um item de uma O.S.
*   `GET, POST, PUT, DELETE /api/parts`: CRUD completo para gerenciamento de peças.

### 3. Lógica de Negócio

*   A lógica será encapsulada em `services` (ex: `ServiceOrderService`, `PartService`) para manter os controladores limpos.
*   Toda a lógica de negócio (cálculo de orçamento, atualização de status, baixa de estoque de peças) será transacional para garantir a consistência dos dados.

## Consequências

### Positivas
*   Cria a fundação para um novo e importante módulo de receita (reparos).
*   Centraliza um processo de negócio crítico em uma única fonte de verdade.
*   A estrutura de dados é escalável para futuras funcionalidades (portal do cliente, relatórios).
*   Permite o rastreamento completo do ciclo de vida de um aparelho na loja.

### Negativas
*   Aumenta a complexidade do esquema do banco de dados.
*   Exige um esforço de desenvolvimento considerável para o backend e, subsequentemente, para o frontend.
*   Introduz um novo tipo de inventário (peças) que precisa ser gerenciado.
