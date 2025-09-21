import globals from "globals";
import pluginJs from "@eslint/js";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"], // Add this line
    languageOptions: {
      globals: globals.browser,
      parser: tseslintParser, // Use the parser here
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin, // Register the plugin
      prettier: prettierPlugin, // Register prettier plugin here as well
      "jsx-a11y": pluginJsxA11y,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules, // Spread recommended rules
      "prettier/prettier": "error",
      ...pluginJsxA11y.configs.recommended.rules,
    },
  },
  pluginJs.configs.recommended,
  pluginReactConfig,
  prettierConfig,
];
