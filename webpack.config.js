const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require('string-replace-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function replaceWithRequire(match) {
  const fname = match.substring(1, match.length - 1);
  if (fs.existsSync(path.join('@CMAKE_CURRENT_BINARY_DIR@', 'src/examples', fname))) {
    return 'require(\"./' + fname + '\")';
  } else {
    return fname;
  }
}

const examples = {
  'examples/windowDemo': path.join('@CMAKE_CURRENT_SOURCE_DIR@', 'src/examples/windowDemo/main'),
};

module.exports = {
  entry: examples,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: StringReplacePlugin.replace({
              replacements: [
                {
                  pattern: /\'\w+\.wasm\'/g,
                  replacement: replaceWithRequire,
                },
                {
                  pattern: /\"\w+\.wasm\"/g,
                  replacement: replaceWithRequire,
                },
                {
                  pattern: /\'\w+\.js\.mem\'/g,
                  replacement: replaceWithRequire,
                },
                {
                  pattern: /\"\w+\.js\.mem\"/g,
                  replacement: replaceWithRequire,
                },
              ],
            }),
          },
        ],
      },
      {
        test: /\.wasm$/,
        loader: 'file-loader',
        options: {
          name: '[sha512:hash:base64:7].[ext]',
        },
      },
      {
        test: /\.js\.mem$/,
        loader: 'file-loader',
        options: {
          name: '[sha512:hash:base64:7].[ext]',
        },
      },
    ],
  },
  resolve: {
    modules: [
      __dirname,
      'node_modules',
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new StringReplacePlugin(),
  ].concat(Object.keys(examples).map(chunk => (
    new HtmlWebpackPlugin({
      title: path.basename(chunk),
      filename: `${chunk}.html`,
      template: path.join('@CMAKE_CURRENT_SOURCE_DIR@', 'src/examples/template.ejs'),
      chunks: [ chunk ],
    })
  ))),
  node: {
    fs: 'empty',
  },
}
