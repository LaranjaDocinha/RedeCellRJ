import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": ["../src/**/*.stories.@(js|jsx|ts|tsx)", "../.storybook/*.mdx"],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  viteFinal: async (config) => {
    return config;
  },
};
export default config;