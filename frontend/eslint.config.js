import globals from "globals";
import pluginJs from "@eslint/js";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";

export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: tseslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      prettier: prettierPlugin,
      "jsx-a11y": pluginJsxA11y,
      react: react,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      "prettier/prettier": "error",
      ...pluginJsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["src/**/*.test.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.vitest,
      },
    },
    rules: {
      // Regras específicas para testes, se houver
    },
  },
  pluginJs.configs.recommended,
  pluginReactConfig,
  prettierConfig,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
    },
  },
];
