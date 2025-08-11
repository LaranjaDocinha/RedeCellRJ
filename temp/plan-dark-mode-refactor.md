# Plano de Ação: Refatoração do Modo Noturno e Consistência de Estilo

## 1. Objetivo

Corrigir todas as inconsistências visuais do modo noturno, como textos e fundos com cores incorretas, garantindo que a aplicação tenha uma aparência coesa e profissional em ambos os temas (claro e escuro).

## 2. Diagnóstico do Problema

As inconsistências geralmente surgem de uma das seguintes causas:
- **Cores Hardcoded:** Uso de valores de cor fixos (ex: `color: '#FFF'`, `background: 'white'`) diretamente nos componentes, em vez de usar as variáveis do tema.
- **Tema Incompleto:** A definição do tema escuro no provedor de tema (ex: Material-UI `createTheme`) está incompleta, faltando especificar cores para certas propriedades como `background.paper`, `text.secondary`, etc.
- **Seletores CSS Globais:** Estilos em arquivos CSS globais que não são compatíveis com o sistema de temas e sobrescrevem os estilos dos componentes.

## 3. Plano de Execução

### Fase 1: Análise e Identificação

1.  **Confirmar a Biblioteca de UI:** Verificar o `frontend/package.json` para confirmar o uso de `@mui/material` e `@emotion/styled`.
2.  **Localizar o Provedor de Tema:** Encontrar onde o `ThemeProvider` do MUI e o contexto de tema customizado são instanciados. Provavelmente em `frontend/src/App.jsx` e `frontend/src/contexts/ThemeContext.js`.
3.  **Analisar a Definição do Tema:** Ler o conteúdo do arquivo de tema (ex: `frontend/src/theme/theme.js`) para inspecionar as paletas de cores `light` e `dark`.
4.  **Buscar por Cores Hardcoded:** Realizar uma busca global no diretório `frontend/src` por padrões de cores fixas (ex: `#[0-9a-fA-F]{3,6}`, `rgb(`, `'white'`, `'black'`) para identificar os componentes que precisam de refatoração.

### Fase 2: Implementação da Correção

1.  **Completar a Paleta do Tema Escuro:** Com base na análise, editar o arquivo de tema e adicionar todas as propriedades de cor que estão faltando na paleta `dark`. Isso inclui:
    - `primary` e `secondary`
    - `error` e `warning`
    - `background.default` e `background.paper`
    - `text.primary`, `text.secondary`, e `text.disabled`
2.  **Refatorar Componentes:**
    - Percorrer a lista de arquivos identificados na Fase 1.
    - Substituir as cores hardcoded por chamadas ao tema.
      - Exemplo em componentes estilizados (Emotion/Styled-Components):
        ```javascript
        // Antes
        const MyComponent = styled('div')`
          background-color: white;
          color: #333;
        `;

        // Depois
        const MyComponent = styled('div')(({ theme }) => `
          background-color: ${theme.palette.background.paper};
          color: ${theme.palette.text.primary};
        `);
        ```
      - Exemplo usando a prop `sx` do MUI:
        ```javascript
        // Antes
        <Box sx={{ backgroundColor: 'white', color: 'black' }}>...</Box>

        // Depois
        <Box sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>...</Box>
        ```

### Fase 3: Validação

1.  Após a aplicação das correções, o servidor de desenvolvimento do frontend deve ser reiniciado.
2.  É necessária uma verificação visual completa das seguintes páginas (e outras importantes) em ambos os modos, claro e escuro:
    - Página de Login
    - Dashboard
    - Página de Perfil do Usuário
    - Páginas de Configurações
    - Formulários de Cadastro/Edição (Clientes, Produtos, etc.)
    - Relatórios

## 4. Próximos Passos

Iniciar a **Fase 1** com a análise dos arquivos de configuração e código-fonte do frontend.
