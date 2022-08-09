import path from 'path';
import { defineConfig } from 'vite';
import { createVuePlugin } from 'vite-plugin-vue2';
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
// import frameWorkUtils from './src/framework/webpackConfigs/utilWebpackAlias';

function resolve(dir) {
  return path.join(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // https: true,
  },
  resolve: {
    extensions: ['.vue', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@': resolve('src'),
      appConfig: resolve('src/configs/globalConfigs/development.config.js'),
      // vue$: 'vue/dist/vue.esm.js',
      '@images': resolve('src/resources/images'),
      // ...frameWorkUtils(resolve),
      '@configs': resolve('src/configs'),
      '@framework': resolve('src/framework/index.js'),
      '@httpService': resolve('src/framework/services/httpService.js'),
      '@cacheService': resolve('src/framework/services/cacheService.js'),
      '@routerService': resolve('src/framework/services/routerService.js'),
      '@numberFormat': resolve('src/framework/components/utils/numberFormat.js'),
      '@logger': resolve('src/framework/components/utils/logger.js'),
      '@libRegister': resolve('src/framework/libRegister.json'),
      'prosemirror-tables/src/columnresizing': resolve(
        './node_modules/prosemirror-tables/src/columnresizing',
      ),
    },
  },
  plugins: [
    createVuePlugin({
      jsx: true,
    }),
    viteCommonjs()
  ],
  optimizeDeps: {
    exclude: ['mihoyo-admin-model'],
  },
});
