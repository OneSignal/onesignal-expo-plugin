import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    coverage: {
      enabled: true,
      reporter: ['text-summary', 'lcov'],
      reportOnFailure: true,
    },
  },
  pack: {
    entry: {
      index: 'src/onesignal/withOneSignal.ts',
      plugin: 'src/onesignal/plugin.ts',
    },
    format: 'cjs',
    fixedExtension: false,
    dts: true,
    deps: {
      onlyBundle: [],
    },
  },
});
