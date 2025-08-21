# Diretrizes de Design do Projeto

Este documento serve como o guia central para todas as decisões de design e padrões visuais do projeto. Ele deve ser atualizado e consultado por designers e desenvolvedores para garantir consistência e qualidade em toda a interface do usuário.

## 1. Paleta de Cores

*   **Cores Primárias:**
    *   `--primary-color: #XXXXXX;` (Ex: Azul Principal)
    *   `--secondary-color: #XXXXXX;` (Ex: Verde Secundário)
*   **Cores Neutras:**
    *   `--text-color: #XXXXXX;`
    *   `--background-color: #XXXXXX;`
    *   `--border-color: #XXXXXX;`
*   **Cores de Feedback:**
    *   `--success-color: #XXXXXX;`
    *   `--warning-color: #XXXXXX;`
    *   `--error-color: #XXXXXX;`

## 2. Tipografia

*   **Família de Fontes:** `'Nome da Fonte', sans-serif;`
*   **Tamanhos de Fonte:**
    *   `--font-size-h1: XXpx;`
    *   `--font-size-h2: XXpx;`
    *   `--font-size-body: XXpx;`
    *   `--font-size-small: XXpx;`
*   **Pesos de Fonte:** Light, Regular, Medium, Bold

## 3. Espaçamento

Utilizar uma escala de espaçamento consistente (ex: múltiplos de 4px ou 8px).

*   `--spacing-xs: Xpx;`
*   `--spacing-sm: Xpx;`
*   `--spacing-md: Xpx;`
*   `--spacing-lg: Xpx;`
*   `--spacing-xl: Xpx;`

## 4. Princípios de Material Design

Adotar os princípios do Material Design para:

*   **Elevação e Sombras:** Para indicar hierarquia e interatividade.
*   **Componentes:** Utilizar componentes que sigam as diretrizes do Material Design.
*   **Animações:** Animações com propósito, suaves e responsivas.

## 5. Modo Escuro (Dark Mode)

As cores e elementos devem ser projetados para funcionar harmoniosamente tanto no tema claro quanto no escuro. As variáveis de cor devem ser definidas de forma a permitir fácil alternância.

## 6. Ícones

*   Utilizar ícones vetoriais (SVG) sempre que possível.
*   Manter a consistência no estilo dos ícones.

## 7. Ilustrações e Imagens

*   Diretrizes para o uso de ilustrações em estados vazios, telas de erro, etc.
*   Otimização de imagens para performance.

## 8. Acessibilidade

*   Garantir contraste de cores adequado.
*   Utilizar semântica HTML correta.
*   Fornecer alternativas de texto para imagens e elementos não textuais.

---

**Como Contribuir:**

Este documento é vivo e deve ser atualizado conforme novas decisões de design são tomadas ou padrões evoluem. Para propor alterações, crie um Pull Request com as modificações e discuta com a equipe de design/desenvolvimento.