import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    const root = path.resolve(__dirname, '..');

    config.resolve ??= {};
    config.resolve.alias = {
      ...(Array.isArray(config.resolve.alias)
        ? Object.fromEntries(
            config.resolve.alias.map((a: any) => [a.find, a.replacement])
          )
        : { ...config.resolve.alias }),
      '@': root,
      'next/navigation': path.resolve(__dirname, 'mock-next-navigation.ts'),
      'next/link': path.resolve(__dirname, 'mock-next-link.tsx'),
    };

    return config;
  },
};

export default config;
