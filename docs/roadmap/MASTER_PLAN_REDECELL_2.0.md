# MASTER PLAN: Redecell RJ 2.0 (The "Big 5" Update)

Este documento detalha o plano de execução para implementar 5 grandes melhorias no sistema com a filosofia "Zero Rework".

## Visão Geral das Features

1.  **Portal do Cliente (Self-Service)**: Rastreamento de OS, aprovação de orçamento e pagamento.
2.  **Integração WhatsApp**: Notificações automáticas baseadas em eventos.
3.  **App do Técnico (Mobile First)**: Checklist, fotos e baixa rápida.
4.  **Marketplace Hub**: Sincronização de estoque omnichannel.
5.  **Smart Pricing**: Precificação dinâmica baseada em regras.

---

## Fases de Execução

### Fase 1: Fundação de Dados (A Espinha Dorsal) - **CONCLUÍDA**
**Objetivo:** Preparar o banco de dados para suportar TODAS as funcionalidades futuras sem precisar de "migrations picadas".
*   [x] Criar Schema para `marketplace_configs` e `marketplace_listings`.
*   [x] Criar Schema para `whatsapp_templates` e `whatsapp_logs`.
*   [x] Adicionar colunas em `service_orders` (public_token, inspection_data).
*   [x] Criar tabela `service_order_photos`.
*   [x] Criar tabelas para `pricing_rules` e histórico (`price_history`).
*   [x] **Status:** Migração `20251207000000_master_schema.cjs` criada e executada. Banco de dados com todas as tabelas e colunas necessárias. Seed de dados iniciais (incluindo RBAC) executado.

### Fase 2: O Motor de Comunicação (WhatsApp + Eventos) - **CONCLUÍDA**
**Objetivo:** O sistema deve "falar" sozinho.
*   [x] Implementar Serviço de Mensageria (`WhatsappService` em `backend/src/services/whatsappService.ts`).
*   [x] Criar "Event Bus" para disparar mensagens quando: OS criada, Orçamento pronto, Venda finalizada.
    *   [x] Listener `whatsappListener.ts` criado para `sale.created`.
    *   [x] Templates padrão (`sale_created`, `os_created`, `os_status_changed`, `os_ready`) semeados (`backend/scripts/seed_whatsapp_templates.ts`).
*   **Status:** Backend pronto para enviar notificações por WhatsApp. Frontend não implementado para gerenciar templates.

### Fase 3: Portal do Cliente (Frontend Público) - **BACKEND CONCLUÍDO, FRONTEND CONCLUÍDO (Componentes, Páginas, Rotas)**
**Objetivo:** Reduzir suporte humano.
*   [x] Criar endpoints públicos (protegidos por token hash, sem login).
    *   [x] `publicPortalService.ts` (Serviço de lógica de negócio).
    *   [x] `publicPortalController.ts` (Controlador da API).
    *   [x] `publicPortalRoutes.ts` (Rotas `/api/portal`).
*   [x] Criar layout React simplificado (Mobile first) para o cliente.
    *   [x] Componente `CustomerPortalLayout.tsx` (Layout base).
    *   [x] Componente `CustomerAuthForm.tsx` (Formulário de login/autenticação).
    *   [x] Componente `OrderTrackingCard.tsx` (Card de visualização da OS).
    *   [x] Componente `BudgetApprovalForm.tsx` (Formulário de aprovação de orçamento).
*   [x] Integrar aprovação de orçamento (mudança de status no backend).
*   [x] Páginas Frontend (`CustomerPortalAuthPage.tsx`, `CustomerPortalTrackingPage.tsx`) e rotas configuradas (`/portal/auth`, `/portal/:token`).
*   **Status:** Backend e Frontend (componentes, páginas, rotas) para o Portal do Cliente estão completos. Animações Framer Motion adicionadas ao `CustomerAuthForm` e `OrderTrackingCard`.

### Fase 4: App do Técnico (Mobile First) - **BACKEND CONCLUÍDO, FRONTEND CONCLUÍDO (Componentes, Páginas, Rotas)**
**Objetivo:** Agilidade na bancada.
*   [x] Implementar upload de imagens (S3 ou Local) no backend.
    *   [x] Reutilizado `uploadsRouter` (salva em `backend/uploads`).
    *   [x] `techAppService.ts` com `addServicePhoto`.
    *   [x] `service_order_photos` no banco.
*   [x] Criar rota `/tech` no Frontend com UI simplificada (botões grandes, fluxo linear).
    *   [x] `techAppService.ts` (Serviço de lógica de negócio).
    *   [x] `techAppController.ts` (Controlador da API).
    *   [x] `techAppRoutes.ts` (Rotas `/api/tech`).
    *   [x] Componente `TechOrderCard.tsx` (Card de OS para técnico).
    *   [x] Componente `PhotoUploadComponent.tsx` (Upload de fotos).
    *   [x] Componente `ChecklistFormComponent.tsx` (Formulário de checklist).
*   [x] Implementar Checklist Obrigatório antes de iniciar serviço.
    *   [x] `submitChecklist` em `techAppService.ts`.
    *   [x] `inspection_checklist` em `service_orders` no banco.
*   [x] Páginas Frontend (`TechOrderListPage.tsx`, `TechOrderDetailPage.tsx`) e rotas configuradas (`/tech`, `/tech/:id`).
*   **Status:** Backend e Frontend (componentes, páginas, rotas) para o App do Técnico estão completos. Animações Framer Motion adicionadas ao `TechOrderCard`.

### Fase 5: Inteligência e Expansão (Smart Pricing) - **BACKEND CONCLUÍDO, FRONTEND (Componentes, Páginas, Rotas) CONCLUÍDO**
**Objetivo:** Aumentar lucro e canais de venda.
*   [x] Criar Jobs (Cron) para analisar estoque e aplicar regras de preço.
    *   [x] `smartPricingService.ts` (Serviço com lógica das regras).
    *   [x] `smartPricingJob.ts` (Cron Job para agendamento diário).
    *   [x] Integrado em `backend/src/jobs/cronJobs.ts`.
*   [x] Componente `PricingRuleCard.tsx` (Exibição da regra).
*   [x] Componente `PricingRuleForm.tsx` (Formulário de criação/edição).
*   [x] Página Frontend (`SmartPricingPage.tsx`) e rota configurada (`/smart-pricing`).
*   **Status:** Backend e Frontend (componentes, páginas, rotas) para Smart Pricing estão completos.

### Fase 6: Inteligência e Expansão (Marketplace Hub) - **BACKEND CONCLUÍDO, FRONTEND (Componentes, Páginas, Rotas) CONCLUÍDO**
**Objetivo:** Aumentar lucro e canais de venda.
*   [x] Implementar adaptadores para Mercado Livre/Shopee (mock inicial, estrutura real depois).
    *   [x] `marketplaceSyncService.ts` refatorado para usar padrão Adapter.
    *   [x] Métodos `updateStock`, `syncMarketplaceOrders` e `createListing` implementados.
*   [x] Componente `MarketplaceIntegrationCard.tsx` (Exibição do status da integração).
*   [x] Componente `MarketplaceListingForm.tsx` (Formulário de mapeamento de produtos).
*   [x] Página Frontend (`MarketplacePage.tsx`) e rota configurada (`/marketplace`).
*   **Status:** Backend e Frontend (componentes, páginas, rotas) para Marketplace Hub estão completos.

---

## Detalhamento Técnico (Architecture Decision Records) - **ATUALIZADO**

### Banco de Dados
*   **Status:** Completo e migrado com `20251207000000_master_schema.cjs`. Inclui todas as tabelas e colunas para as 5 features, além de RBAC, Parts, Checklists, etc.
*   Evitamos alterar tabelas `core` (como `sales` e `products`) diretamente várias vezes. Usamos tabelas de extensão sempre que possível (ex: `product_marketplace_data`) para manter o core limpo.

### Frontend
*   **Status:** Componentes, Páginas e Rotas para todas as 5 features implementados.
*   **Portal Cliente:** Rota `/portal/auth` para autenticação e `/portal/:token` para rastreamento (Layout limpo, sem sidebar).
*   **Modo Técnico:** Rota `/tech` para listagem e `/tech/:id` para detalhes (Layout focado em touch).
*   **Gerenciamento Administrativo:** Rotas `/marketplace` e `/smart-pricing` para configuração das novas funcionalidades.
*   **Animações:** Framer Motion adicionado em `CustomerAuthForm`, `TechOrderCard` e `OrderTrackingCard` para polimento UI/UX.

### Backend
*   **Status:** Serviços, Controladores e Rotas para todas as 5 features implementados.
*   Seguimos o padrão `Service` + `Listener` + `Cron Job` onde aplicável.
*   Ex: Quando `ServiceOrderService.updateStatus` é chamado, ele emite um evento `os.status.updated`.
*   O `WhatsAppService` escuta esse evento e dispara a mensagem.
*   Isso desacopla a lógica de negócio da lógica de notificação.