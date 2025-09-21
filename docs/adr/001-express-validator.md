# 1. Escolha do Express-Validator para Validação de Entrada

*   **Status:** Aceito
*   **Data:** 2025-09-08

## Contexto

A aplicação precisa de uma forma robusta e padronizada para validar todos os dados que chegam às rotas da API no backend. A falta de validação pode levar a erros inesperados, corrupção de dados e vulnerabilidades de segurança.

## Decisão

Adotaremos a biblioteca `express-validator` como a solução padrão para validação de entrada em todas as rotas do Express.js.

## Justificativa

*   **Integração com Express:** Foi projetada especificamente para funcionar como middleware no Express, tornando a integração limpa e idiomática.
*   **API Declarativa:** A validação é definida através de cadeias de regras declarativas, o que torna o código fácil de ler e manter.
*   **Rica em Funcionalidades:** Oferece uma vasta gama de validadores e sanitizadores prontos para uso.
*   **Customizável:** Permite a criação de validadores customizados para regras de negócio específicas.
*   **Segurança:** Ajuda a mitigar vulnerabilidades comuns, como injeção de dados, garantindo que os dados tenham o formato esperado antes de serem processados.
