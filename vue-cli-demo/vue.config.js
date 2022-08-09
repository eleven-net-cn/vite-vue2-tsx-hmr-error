const path = require('path');
const { defineConfig } = require('@vue/cli-service');
const frameWorkUtils = require('./src/framework/webpackConfigs/utilWebpackAlias');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
        appConfig: resolve('src/configs/globalConfigs/development.config.js'),
        // vue$: 'vue/dist/vue.esm.js',
        '@images': resolve('src/resources/images'),
        ...frameWorkUtils(resolve),
        'prosemirror-tables/src/columnresizing': resolve('./node_modules/prosemirror-tables/src/columnresizing')
      },
    },
  },
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    allowedHosts: 'all',
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    // },
    client: {
      webSocketURL: {
        // https://webpack.js.org/configuration/dev-server/#websocketurl
        hostname: '0.0.0.0',
      },
    },
  },
});
