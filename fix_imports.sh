#!/bin/bash

# Script para adicionar .js a importações relativas em arquivos TypeScript

# Navega para o diretório backend/src
# cd backend/src || exit # Não é necessário se o find for relativo ao root

# Itera sobre todos os arquivos .ts dentro de backend/src
find backend/src -name "*.ts" | while read -r file; do
  # Usa sed para adicionar .js a importações relativas que não terminam com .js
  # A regex busca por: import ... from '.../caminho_relativo' (onde caminho_relativo não termina com .js)
  # E substitui por: import ... from '.../caminho_relativo.js'
  # O '.js' é adicionado apenas se não estiver presente
  sed -i -E "s/(import .* from '(\.\.?\/[^']*)')'/\1.js'/g" "$file"

  # Corrige casos onde .js.js pode ter sido adicionado por erro
  sed -i -E "s/\.js\.js'/.js'/g" "$file"

  echo "Processado: $file"
done
