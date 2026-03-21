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
  lint: { options: { typeAware: true, typeCheck: true } },
  test: {
    coverage: {
      enabled: true,
      reporter: ['text-summary', 'lcov'],
      reportOnFailure: true,
    },
  },
  pack: {
    entry: { index: 'src/onesignal/withOneSignal.ts' },
    format: 'cjs',
    fixedExtension: false,
    dts: true,
    deps: { onlyBundle: [] },
  },
});
