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
    deps: { onlyBundle: [] },
  },
});
