#!/bin/bash

# Find all test files and run vitest for each one
find src -name "*.test.tsx" -print0 | while IFS= read -r -d '\0' file; do
  echo "Running test: $file"
  npx vitest --run "$file"
  if [ $? -ne 0 ]; then
    echo "Test failed: $file"
    exit 1
  fi
done