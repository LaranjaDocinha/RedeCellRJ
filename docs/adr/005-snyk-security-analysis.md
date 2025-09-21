# ADR 004: Fortalecimento da Análise de Segurança no CI com Snyk

## 1. Título
Fortalecimento da Análise de Segurança no CI com Snyk

## 2. Status
Proposto

## 3. Contexto
Atualmente, a análise de segurança no pipeline de CI se limita ao `npm audit`, que oferece uma verificação básica de vulnerabilidades em dependências. Para um sistema robusto, é necessário uma análise de segurança estática (SAST) mais abrangente que cubra não apenas as dependências, mas também o código-fonte da aplicação, e, idealmente, uma análise dinâmica (DAST).

## 4. Decisão
Decidimos integrar o Snyk para fortalecer a análise de segurança estática (SAST) no pipeline de CI.

### 4.1. Por que Snyk?
*   **Cobertura Abrangente:** O Snyk oferece análise de vulnerabilidades em dependências (similar ao `npm audit`, mas mais robusto), análise de código estático (SAST) para o código-fonte da aplicação e, opcionalmente, análise de contêineres e IaC.
*   **Integração com GitHub Actions:** Possui uma ação oficial e bem mantida para GitHub Actions, facilitando a integração no nosso pipeline existente.
*   **Foco em Desenvolvedores:** Projetado para ser amigável ao desenvolvedor, fornecendo feedback rápido e acionável sobre vulnerabilidades.
*   **Base de Dados de Vulnerabilidades:** Mantém uma das maiores bases de dados de vulnerabilidades de código aberto.

### 4.2. Estratégia de Integração (Alto Nível)
1.  **Configuração da Conta Snyk:** Criar uma conta Snyk e obter um token de API.
2.  **Integração no GitHub Actions:** Adicionar uma etapa no `backend-ci.yml` para executar o Snyk.
3.  **Análise de Dependências:** Configurar o Snyk para escanear as dependências do `backend/package.json`.
4.  **Análise de Código Estático (SAST):** Configurar o Snyk para escanear o código-fonte do backend em busca de vulnerabilidades comuns (ex: injeção SQL, XSS, etc.).
5.  **Relatórios e Alertas:** Configurar o Snyk para gerar relatórios e, se necessário, integrar com sistemas de alerta.

## 5. Consequências
*   **Positivas:**
    *   Detecção precoce e mais abrangente de vulnerabilidades de segurança.
    *   Melhora da postura de segurança do projeto.
    *   Feedback de segurança automatizado para os desenvolvedores.
*   **Negativas:**
    *   Custo potencial (Snyk possui planos pagos para funcionalidades avançadas e uso em equipes maiores).
    *   Aumento do tempo de execução do pipeline de CI.
    *   Necessidade de gerenciar um token de API do Snyk.

## 6. Alternativas Consideradas
*   **SonarQube:** Ferramenta robusta para qualidade de código e segurança, mas pode ser mais complexa de configurar e manter.
*   **Outras Ferramentas SAST:** Como Bandit (Python), ESLint Security Plugin (JS). Snyk oferece uma solução mais unificada.

## 7. Mais Informações
N/A
