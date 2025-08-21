# Análise de Papéis e Permissões (RBAC)

Este documento detalha a estrutura atual de Role-Based Access Control (RBAC) do sistema, com base nos schemas do banco de dados e nos dados de seed.

## 1. Estrutura do Banco de Dados

### Tabela `roles`
Representa os diferentes papéis que um usuário pode ter no sistema.

| Coluna      | Tipo        | Restrições                               |
|-------------|-------------|------------------------------------------|
| `id`        | SERIAL      | PRIMARY KEY                              |
| `name`      | VARCHAR(50) | UNIQUE, NOT NULL (ex: 'admin', 'technician') |
| `description` | TEXT        |                                          |
| `created_at`| TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                  |
| `updated_at`| TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                  |

### Tabela `permissions`
Define as permissões granulares que podem ser atribuídas a um papel.

| Coluna      | Tipo        | Restrições                               |
|-------------|-------------|------------------------------------------|
| `id`        | SERIAL      | PRIMARY KEY                              |
| `name`      | VARCHAR(100)| UNIQUE, NOT NULL (ex: 'users:create', 'products:read') |
| `description` | TEXT        |                                          |
| `created_at`| TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                  |
| `updated_at`| TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                  |

### Tabela `role_permissions`
Estabelece a relação muitos-para-muitos entre `roles` e `permissions`.

| Coluna          | Tipo | Restrições                               |
|-----------------|------|------------------------------------------|
| `role_id`       | INT  | NOT NULL, FOREIGN KEY REFERENCES `roles(id)` ON DELETE CASCADE |
| `permission_id` | INT  | NOT NULL, FOREIGN KEY REFERENCES `permissions(id)` ON DELETE CASCADE |
| PRIMARY KEY     |      | (`role_id`, `permission_id`)             |

## 2. Papéis Padrão (Seed Data)

Os seguintes papéis são inseridos por padrão no sistema:

*   **`admin`**: Administrador do sistema com acesso total.
*   **`technician`**: Técnico responsável por reparos e gestão de OS.
*   **`user`**: Usuário padrão com acesso ao PDV e gestão de clientes.

## 3. Permissões Padrão (Seed Data)

Uma lista abrangente de permissões é definida, seguindo a convenção `modulo:ação` (ex: `users:create`).

### Exemplos de Permissões:

*   **Usuários:** `users:create`, `users:read`, `users:update`, `users:delete`, `users:manage-roles`
*   **Produtos:** `products:create`, `products:read`, `products:update`, `products:delete`
*   **Ordens de Serviço (OS):** `repairs:create`, `repairs:read`, `repairs:update`, `repairs:delete`, `repairs:assign`
*   **Vendas:** `sales:create`, `sales:read`, `sales:cancel`
*   **Clientes:** `customers:create`, `customers:read`, `customers:update`, `customers:delete`
*   **Relatórios:** `reports:view:financial`, `reports:view:operational`
*   **Configurações:** `settings:manage`

## 4. Atribuição de Permissões a Papéis Padrão

*   **`admin`**: Possui **todas** as permissões.
*   **`technician`**: Possui as seguintes permissões:
    *   `products:read`
    *   `repairs:create`
    *   `repairs:read`
    *   `repairs:update`
    *   `customers:read`
*   **`user`**: Possui as seguintes permissões:
    *   `products:read`
    *   `sales:create`
    *   `sales:read`
    *   `customers:create`
    *   `customers:read`
    *   `customers:update`

## 5. Observações

*   A função `assignPermissionsToRole` no `roleController.js` atualmente remove todas as permissões existentes para um papel e insere as novas. Isso simplifica a lógica de atualização, mas significa que a atribuição é sempre uma substituição completa.
*   A estrutura é robusta e permite granularidade no controle de acesso.
