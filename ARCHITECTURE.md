# Arquitetura do Sistema RedecellRJ (Nível Enterprise)

> **Status:** Production Ready (Pro Max Grade)
> **Stack:** Node.js, Express, TypeScript, PostgreSQL, Redis, React, Vite.

## 1. Visão Geral
O RedecellRJ é uma plataforma de gestão e PDV projetada para alta performance, segurança bancária e escalabilidade horizontal. Diferente de sistemas monolíticos tradicionais, ele opera com uma arquitetura modular baseada em serviços, preparada para integração com IA e microsserviços.

## 2. Pilares de Engenharia

### 2.1. Segurança (Security First)
- **CSP Estrito:** Implementação de `helmet` com geração de `nonces` criptográficos por requisição para prevenir XSS.
- **Transações Atômicas:** Uso do `TransactionManager` para garantir consistência ACID absoluta. Nenhuma venda é registrada pela metade.
- **Sanitização Profunda:** Todos os inputs passam por `xssSanitizer` e validação `Zod`.

### 2.2. Performance (Speed as a Feature)
- **Redis Caching:** Camada de cache inteligente para rotas de leitura frequente (Catálogo, Configurações).
- **Compression:** Gzip/Brotli habilitado no tráfego de dados JSON e Assets estáticos.
- **Server-Timing API:** Observabilidade em tempo real. O frontend sabe exatamente quanto tempo o banco de dados demorou para responder (header `Server-Timing`).

### 2.3. Inteligência (AI Ready)
- **Motor Preditivo Modular:** O `aiInventoryService` utiliza o padrão *Strategy*, permitindo alternar entre modelos heurísticos (estatística) e modelos de LLM (OpenAI/Gemini) apenas via configuração de ambiente.

## 3. Estrutura de Diretórios (Backend)

```
src/
├── controllers/      # Camada de entrada (HTTP) - Sem lógica de negócio.
├── services/         # Lógica de negócio pura. Onde a mágica acontece.
├── repositories/     # Acesso a dados (SQL). Abstrai o banco.
├── middlewares/      # Interceptadores (Auth, Cache, Logs, Performance).
├── jobs/             # Processamento assíncrono (BullMQ/Redis).
├── utils/            # Ferramentas compartilhadas (Logger, TransactionManager).
└── db/               # Migrações e Seeds.
```

## 4. Fluxo de uma Requisição (The Life of a Request)

1. **Entrada:** Nginx/Load Balancer -> Express.
2. **Segurança:** Helmet & Rate Limit protegem contra abuso.
3. **Observabilidade:** `performanceTracer` inicia o cronômetro.
4. **Cache:** `cacheMiddleware` verifica o Redis. Se HIT, retorna em <10ms.
5. **Controller:** Recebe a requisição e valida o schema (Zod).
6. **Service:** Executa a regra de negócio (ex: `saleService`).
   - Se precisar escrever: Abre transação via `TransactionManager`.
7. **Repository:** Executa o SQL no PostgreSQL.
8. **Resposta:** `ResponseHelper` padroniza o JSON (JSend pattern).
9. **Saída:** Compressão Gzip e envio ao cliente.

## 5. Próximos Passos (Roadmap 10/10)
- **WebAuthn:** Implementar login biométrico (Passkeys).
- **Offline-First:** Sincronização via PouchDB/RxDB no frontend.
- **LLM Real:** Conectar `aiInventoryService` à API da OpenAI para insights textuais.
