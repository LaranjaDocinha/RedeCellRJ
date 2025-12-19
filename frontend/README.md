# RedeCellRJ - Frontend

Este é o módulo de interface do usuário do sistema RedeCellRJ, desenvolvido para proporcionar uma experiência de gestão de PDV fluida, moderna e visualmente rica.

## 🎨 Design e UX

O frontend foi construído seguindo princípios de **Material Design**, com uma camada de personalização profunda para refletir a identidade visual da RedeCellRJ.

- **Framer Motion:** Utilizado para microinterações, transições de página e animações de feedback.
- **Styled Components:** Para uma estilização modular e altamente dinâmica.
- **Responsividade:** Totalmente adaptável para desktops, tablets e dispositivos móveis.
- **Tema Personalizado:** Suporte a Light/Dark mode com cores e sombras otimizadas para longas jornadas de trabalho.

## 🚀 Tecnologias Principais

- **React 18 & TypeScript:** Base sólida para uma aplicação escalável e tipada.
- **React Router 6:** Gerenciamento de rotas com loaders para pré-carregamento de dados.
- **Context API:** Gerenciamento de estado global para Autenticação, Tema e Notificações.
- **ApexCharts:** Visualização de dados complexos através de gráficos interativos.
- **Storybook:** Nosso guia de estilo vivo, onde cada componente é documentado e testado isoladamente.
- **Cypress:** Testes de ponta a ponta (E2E) para garantir o funcionamento dos fluxos críticos.

## 📁 Estrutura de Pastas

```text
src/
├── components/   # Componentes reutilizáveis (botões, cards, modais)
├── contexts/     # Provedores de estado global
├── hooks/        # Hooks customizados para lógica reutilizável
├── pages/        # Telas principais da aplicação
├── services/     # Integração com a API do Backend
├── store/        # Gerenciamento de estado (se aplicável)
├── stories/      # Documentação visual do Storybook
└── styles/       # Tokens de design, temas e estilos globais
```

## 🛠️ Comandos de Desenvolvimento

No diretório `frontend`, você pode executar:

### `npm start`
Inicia a aplicação em modo de desenvolvimento em `http://localhost:3000`.

### `npm test`
Executa os testes unitários via Jest/React Testing Library.

### `npm run storybook`
Inicia o Storybook em `http://localhost:6006` para visualizar a biblioteca de componentes.

### `npm run build`
Gera o pacote de produção otimizado na pasta `build`.

### `npm run lint`
Executa o ESLint para garantir a padronização do código.

## 🧪 Qualidade Visual

Utilizamos o **Storybook** como nossa fonte da verdade para o design. Antes de implementar qualquer componente na aplicação, ele deve ser criado e validado no Storybook. Isso garante:
1.  **Consistência:** Componentes idênticos em todo o sistema.
2.  **Acessibilidade:** Testes de contraste e navegação via teclado.
3.  **No Rework:** Evita a criação de componentes duplicados.

---

<p align="center">Parte do ecossistema RedeCellRJ</p>