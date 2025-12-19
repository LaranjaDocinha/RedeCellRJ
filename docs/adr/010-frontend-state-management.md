# 10. Estratégia de Gerenciamento de Estado no Frontend

Data: 2025-11-30

## Contexto
O projeto atualmente apresenta uma mistura de Context API e uma pasta `store` (indicando possível uso de Redux ou similar), o que gera confusão sobre onde armazenar e buscar dados. Para manter a consistência e evitar complexidade acidental, precisamos definir uma estratégia clara.

## Decisão

Adotaremos uma abordagem híbrida baseada na natureza do estado:

1.  **Server State (Dados da API):**
    *   Utilizar **TanStack Query (React Query)** (se disponível/adicionado) ou `useEffect` + Context com cache manual (menos recomendado).
    *   *Motivo:* Gerencia cache, loading, error e refetching automaticamente.

2.  **Client State (UI/Sessão):**
    *   **Context API + Hooks Customizados:** Para estados globais simples e pouco frequentes (ex: Tema, Dados do Usuário Logado, Toast Notifications).
    *   **Zustand (Recomendado pela simplicidade) ou Redux Toolkit:** Apenas para estados globais complexos com muitas atualizações frequentes (ex: Carrinho de Compras do PDV, Lista de Itens em Edição). Se Redux já estiver instalado, manter e refatorar para Redux Toolkit (Slices).

## Consequências
*   Devemos migrar gradualmente os estados existentes para este padrão.
*   Reduz a necessidade de prop drilling.
*   Melhora a performance evitando re-renders desnecessários (especialmente com Zustand/Redux).
