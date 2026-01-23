// const webpack = require('webpack');
// const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const packageName = require('./package.json').name;

// module.exports = {
//   devServer: (configFunction) => (proxy, allowedHost) => {
//     const config = configFunction(proxy, allowedHost);

//     // config.historyApiFallback = true;
//     config.open = false;
//     config.hot = false;
//     config.watchContentBase = false;
//     config.liveReload = false;
//     config.headers = {
//       'Access-Control-Allow-Origin': '*',
//     };
//     return config;
//   },

//   webpack: function (config, webpackEnv) {
//     const isEnvProduction = webpackEnv === 'production';
//     config.output.library = `${packageName}-[name]`;
//     config.output.libraryTarget = 'umd';
//     // config.output.publicPath = 'app3/';
//     // webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
//     config.output.jsonpFunction = `webpackJsonp_${packageName}`;
//     config.output.globalObject = 'window';

//     // 确保在qiankun环境下资源能够正确加载
//     if (!isEnvProduction) {
//       config.output.publicPath = '/';
//     }

//     config.module.rules.push({
//       test: /\.mjs$/,
//       include: /node_modules/,
//       type: 'javascript/auto',
//     });

//     // 添加字体文件处理规则，确保在qiankun环境下正确加载
//     config.module.rules.push({
//       test: /\.(woff|woff2|eot|ttf|otf)$/,
//       use: {
//         loader: 'file-loader',
//         options: {
//           name: 'static/fonts/[name].[contenthash:8].[ext]',
//           publicPath: (url) => {
//             // 在qiankun环境下使用动态public path
//             if (
//               typeof window !== 'undefined' &&
//               window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
//             ) {
//               return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + url;
//             }
//             return url;
//           },
//         },
//       },
//     });

//     // 确保SCSS文件在qiankun环境下正确加载
//     // 通过修改MiniCssExtractPlugin的配置来处理动态publicPath
//     if (isEnvProduction) {
//       config.plugins.forEach((plugin, index) => {
//         if (plugin instanceof MiniCssExtractPlugin) {
//           // 更新MiniCssExtractPlugin配置以支持qiankun环境
//           config.plugins[index] = new MiniCssExtractPlugin({
//             filename: 'static/css/[name].css?version=[contenthash]',
//             chunkFilename: 'static/css/[name].css?version=[contenthash]',
//             publicPath: (url) => {
//               // 在qiankun环境下使用动态public path
//               if (
//                 typeof window !== 'undefined' &&
//                 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
//               ) {
//                 return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + url;
//               }
//               return url;
//             },
//           });
//         }
//       });
//     }

//     // 为开发环境也添加样式处理支持
//     if (!isEnvProduction) {
//       // 确保开发环境下的样式文件也能正确处理
//       config.module.rules.forEach((rule, index) => {
//         if (rule.test && rule.test.toString().includes('scss|sass|css')) {
//           if (rule.use && Array.isArray(rule.use)) {
//             rule.use.forEach((use) => {
//               if (
//                 typeof use === 'object' &&
//                 use.loader &&
//                 use.loader.includes('css-loader')
//               ) {
//                 use.options = use.options || {};
//                 use.options.publicPath = (url) => {
//                   if (
//                     typeof window !== 'undefined' &&
//                     window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
//                   ) {
//                     return window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ + url;
//                   }
//                   return url;
//                 };
//               }
//             });
//           }
//         }
//       });
//     }

//     // Optimization Overrides
//     config.optimization.splitChunks = {
//       cacheGroups: {
//         default: false,
//       },
//     };
//     config.optimization.runtimeChunk = true;

//     // Output Overrides.
//     if (isEnvProduction) {
//       // JS static filenames overrides.
//       config.output.filename = 'static/js/[name].js?version=[contenthash]';
//       config.output.chunkFilename = 'static/js/[name].js?version=[contenthash]';
//     }

//     // Plugins Overrides.
//     if (isEnvProduction) {
//       // CSS static filenames overrides.
//       config.plugins.forEach((plugin, index) => {
//         if (plugin instanceof MiniCssExtractPlugin) {
//           // remove the existing MiniCssExtractPlugin and add new one
//           config.plugins.splice(
//             index,
//             1,
//             new MiniCssExtractPlugin({
//               filename: 'static/css/[name].css?version=[contenthash]',
//               chunkFilename: 'static/css/[name].css?version=[contenthash]',
//             }),
//           );
//         }
//       });
//     }

//     // Add external variable for base path support.
//     config.plugins.push(
//       new WebpackDynamicPublicPathPlugin({
//         externalPublicPath:
//           'window.externalPublicPath || window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__',
//       }),
//     );

//     config.plugins.push(
//       new webpack.DefinePlugin({
//         __DEV__: !isEnvProduction,
//       }),
//     );
//     return config;
//   },
// };

const webpack = require('webpack');
const WebpackDynamicPublicPathPlugin = require('webpack-dynamic-public-path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  devServer: (configFunction) => (proxy, allowedHost) => {
    const config = configFunction(proxy, allowedHost);

    // config.historyApiFallback = true;
    // config.open = false;
    // config.hot = false;
    // config.watchContentBase = false;
    // config.liveReload = false;
    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    return config;
  },
  webpack: function (config, webpackEnv) {
    const isEnvProduction = webpackEnv === 'production';

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Optimization Overrides
    // 禁用自动 vendors chunk 合并，避免 chunk 名称不一致的问题
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        // 禁用默认的 vendors chunk，让每个模块使用自己的 chunk 名称
        vendors: false,
      },
    };
    config.optimization.runtimeChunk = true;

    // Output Overrides.
    if (isEnvProduction) {
      // JS static filenames overrides.
      config.output.filename = 'static/js/[name].js?version=[contenthash]';
      config.output.chunkFilename = 'static/js/[name].js?version=[contenthash]';
    }

    // Plugins Overrides.
    if (isEnvProduction) {
      // CSS static filenames overrides.
      config.plugins.forEach((plugin, index) => {
        if (plugin instanceof MiniCssExtractPlugin) {
          // remove the existing MiniCssExtractPlugin and add new one
          config.plugins.splice(
            index,
            1,
            new MiniCssExtractPlugin({
              filename: 'static/css/[name].css?version=[contenthash]',
              chunkFilename: 'static/css/[name].css?version=[contenthash]',
            }),
          );
        }
      });
    }

    // Add external variable for base path support.
    config.plugins.push(
      new WebpackDynamicPublicPathPlugin({
        externalPublicPath: 'window.externalPublicPath',
      }),
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: !isEnvProduction,
      }),
    );
    return config;
  },
};
