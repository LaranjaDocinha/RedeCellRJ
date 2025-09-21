# ADR 003: Implementação de Tracing Distribuído com OpenTelemetry

## 1. Título
Implementação de Tracing Distribuído com OpenTelemetry

## 2. Status
Proposto

## 3. Contexto
Atualmente, o backend carece de uma solução robusta para rastrear requisições através de múltiplos serviços e componentes. Isso dificulta a depuração de problemas de performance, a identificação de gargalos e o entendimento do fluxo completo de uma requisição, especialmente em um ambiente de microserviços ou com interações complexas.

## 4. Decisão
Decidimos implementar tracing distribuído utilizando o OpenTelemetry.

### 4.1. Por que OpenTelemetry?
*   **Padrão Aberto e Vendor-Neutral:** OpenTelemetry é um conjunto de ferramentas, APIs e SDKs que padronizam a coleta de telemetria (traces, métricas e logs). Não nos prende a um fornecedor específico.
*   **Flexibilidade:** Permite exportar dados para diversos backends de tracing (Jaeger, Zipkin, Prometheus, Datadog, etc.), oferecendo flexibilidade para futuras escolhas de ferramentas de observabilidade.
*   **Instrumentação Abrangente:** Oferece instrumentação automática para muitas bibliotecas e frameworks populares em Node.js, além de APIs para instrumentação manual quando necessário.
*   **Comunidade Ativa:** Grande comunidade e suporte contínuo, garantindo a evolução da ferramenta.

### 4.2. Estratégia de Integração (Alto Nível)
1.  **Instalação das Dependências:** Adicionar os pacotes `@opentelemetry/api`, `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node` e um exportador (ex: `@opentelemetry/exporter-jaeger`) ao backend.
2.  **Configuração do SDK:** Inicializar o SDK do OpenTelemetry no ponto de entrada da aplicação (`backend/src/index.ts` ou um arquivo de configuração dedicado).
3.  **Instrumentação Automática:** Utilizar `auto-instrumentations-node` para instrumentar automaticamente bibliotecas comuns (HTTP, Express, PostgreSQL, etc.).
4.  **Instrumentação Manual (se necessário):** Adicionar instrumentação manual para lógica de negócio crítica ou áreas não cobertas pela instrumentação automática.
5.  **Exportação:** Configurar um exportador para enviar os traces para um coletor (inicialmente Jaeger em ambiente de desenvolvimento).
6.  **Context Propagation:** Garantir que o contexto de tracing seja propagado corretamente através das chamadas de serviço (HTTP headers).

## 5. Consequências
*   **Positivas:**
    *   Maior visibilidade sobre o comportamento do sistema em tempo de execução.
    *   Facilitação da depuração e otimização de performance.
    *   Melhor compreensão do fluxo de requisições.
    *   Base para futuras integrações de métricas e logs padronizados.
*   **Negativas:**
    *   Overhead de performance mínimo (geralmente aceitável).
    *   Curva de aprendizado inicial para configuração e uso.
    *   Necessidade de manter um coletor de traces (ex: Jaeger) em ambiente de desenvolvimento.

## 6. Alternativas Consideradas
*   **Soluções Proprietárias:** Ferramentas como Datadog APM, New Relic. Descartadas devido ao vendor lock-in e custo inicial.
*   **Outras Bibliotecas de Tracing:** Como `express-winston` para logs com contexto de requisição, mas não oferecem tracing distribuído completo.

## 7. Mais Informações
N/A
