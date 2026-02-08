# ADR 011: Estratégia de Escalabilidade e Tipagem Database-First

## Status
Aceito

## Contexto
O sistema RedecellRJ cresceu em complexidade, tornando a manutenção manual de interfaces TypeScript do banco de dados propensa a erros e bugs de integração. Além disso, a falta de uma camada de cache estruturada e isolamento de arquivos (storage) limitava a escalabilidade horizontal.

## Decisões
1.  **Tipagem Database-First:** Implementamos um gerador de tipos automático que lê o schema do PostgreSQL. Isso garante que o TypeScript sempre reflita a realidade do banco.
2.  **Service Cache Wrapper:** Introduzimos um padrão de wrapper para Redis no nível de serviço para acelerar consultas pesadas (Dashboards/Relatórios).
3.  **Storage Abstraction:** Criamos um `IStorageProvider` para permitir a troca entre armazenamento local e S3 sem alterar a lógica de negócio.
4.  **Error Correlation:** Implementamos Error Boundaries com Correlation IDs para facilitar o rastreamento de bugs de produção.

## Consequências
*   **Positivas:** Redução de bugs de "undefined" em colunas de banco, performance superior em áreas de leitura intensa, e facilidade de migração para nuvem.
*   **Negativas:** Requer execução do script de geração após mudanças no schema.
