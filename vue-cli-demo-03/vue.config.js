const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        // '@': appSrc,
        // appConfig: path.join(
        //   appSrc,
        //   'configs/globalConfigs/development.config.js',
        // ),
        // // vue$: 'vue/dist/vue.esm.js',
        // '@images': path.join(appSrc, 'resources/images'),
        // ...frameWorkUtils(resolveOwn),
        // // https://platgit.mihoyo.com/plat/plat-fe/mihoyo-tiptap-rich-text/-/issues/1
        // 'prosemirror-tables/src/columnresizing': path.join(
        //   componentNodeModules,
        //   'prosemirror-tables/src/columnresizing',
        // ),
        // '@componentPath': componentPath,
        // '@componentSrc': componentSrc,
      },
    },
    plugins: [
      /**
       * https://www.npmjs.com/package/webpackbar
       */
      // new WebpackBar(),
    ],
  },
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    // setupExitSignals: true,
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
