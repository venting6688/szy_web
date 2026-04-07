import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import parserVue from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', 'public'],
  },

  // JS 推荐规则
  js.configs.recommended,

  // Vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      ...pluginVue.configs['vue3-recommended'].rules,

      'vue/multi-word-component-names': 'off',
    },
  },

  // Prettier
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
]);
