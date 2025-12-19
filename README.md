# RedeCellRJ - Sistema de PDV Inteligente

![RedeCellRJ Banner](https://raw.githubusercontent.com/LaranjaDocinha/RedeCellRJ/main/frontend/public/logo512.png)

Bem-vindo ao **RedeCellRJ**, um sistema de Ponto de Venda (PDV) de última geração, desenvolvido para oferecer uma experiência robusta, visualmente impactante e extremamente funcional. Este projeto une o que há de mais moderno no desenvolvimento Full-Stack para entregar uma solução completa de gestão comercial.

## 🚀 Visão Geral

O RedeCellRJ foi projetado com foco em **performance, segurança e design**. Com uma interface rica em detalhes, sombras suaves e animações fluidas (via Framer Motion), o sistema transforma a gestão de vendas em uma tarefa intuitiva e profissional.

## 📂 Estrutura do Projeto

O repositório está organizado como um monorepo simplificado:

- **`/backend`**: API REST em Node.js, TypeScript e PostgreSQL. Contém toda a lógica de negócio, integrações e processamento de dados.
- **`/frontend`**: Aplicação Single Page (SPA) em React e TypeScript. Focada em uma experiência de usuário rica e intuitiva.
- **`/docs`**: Documentação técnica, ADRs (Architectural Decision Records) e roadmaps do projeto.
- **`/infrastructure`**: Arquivos de configuração para deploy (Docker, Terraform).

---

## 🛠️ Tecnologias Utilizadas

### **Backend (Cérebro)**
- **Node.js & Express:** API robusta e escalável.
- **TypeScript:** Tipagem estática para código limpo e livre de bugs.
- **PostgreSQL:** Banco de dados relacional de alta performance.
- **Vitest:** Testes unitários e de integração com cobertura rigorosa.
- **BullMQ & Redis:** Processamento de filas e tarefas em segundo plano.

### **Frontend (Experiência)**
- **React & TypeScript:** Interface moderna e reativa.
- **Material UI & Custom Design System:** Visual profissional e personalizável.
- **Framer Motion:** Animações com propósito para uma UX premium.
- **ApexCharts:** Gráficos interativos para dashboards inteligentes.
- **Storybook:** Documentação e testes visuais de componentes de UI.

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação & Autorização:** Controle de acesso seguro com permissões baseadas em funções (RBAC).
- 📦 **Gestão de Inventário:** Controle total de produtos, variações, números de série (IMEI) e alertas de estoque baixo.
- 💰 **PDV Intuitivo:** Checkout rápido, suporte a múltiplos métodos de pagamento e divisão de conta.
- 👤 **Gestão de Clientes:** Visão 360º do cliente, histórico de compras e programas de fidelidade.
- 📊 **Dashboards & Relatórios:** Insights em tempo real sobre vendas, produtos mais vendidos e metas da equipe.
- 💬 **Integração WhatsApp:** Automação de notificações e templates para comunicação direta.
- 🧩 **Arquitetura Modular:** Sistema preparado para crescimento e fácil manutenção.

---

## 🚦 Começando

### Pré-requisitos

- **Node.js:** v20 ou superior
- **PostgreSQL:** v13 ou superior
- **Redis:** Para gerenciamento de filas

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/LaranjaDocinha/RedeCellRJ.git
    cd RedeCellRJ
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd backend && npm install
    ```

3.  **Instale as dependências do Frontend:**
    ```bash
    cd ../frontend && npm install
    ```

4.  **Configuração do Banco de Dados:**
    - Certifique-se que o PostgreSQL está rodando.
    - Crie um banco de dados chamado `pdv_web`.
    - Configure os arquivos `.env` no backend conforme a sua necessidade.

---

## 💻 Desenvolvimento

### Comandos Úteis

#### **Backend**
- `npm run dev`: Inicia o servidor em modo de desenvolvimento.
- `npm test`: Roda a suite de testes unitários e integração.
- `npm run build`: Compila o código TypeScript para JavaScript.

#### **Frontend**
- `npm start`: Inicia o servidor de desenvolvimento do React.
- `npm run storybook`: Abre a documentação visual de componentes.
- `npm run build`: Gera a versão de produção do frontend.

---

## 🧪 Qualidade e Testes

O projeto segue a filosofia **TDD (Test-Driven Development)**, garantindo que cada funcionalidade seja testada antes de ir para produção.
- **Backend:** Cobertura de testes > 90%.
- **Frontend:** Testes de componentes e regressão visual no Storybook.
- **E2E:** Testes de fluxo completo com Cypress.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Desenvolvido com ❤️ para a RedeCellRJ</p>
