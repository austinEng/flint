const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require('string-replace-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const suffix = (@WASM@ ? 'wasm' : 'js');

function replaceWithRequire(match, ext, offset, string) {
  // const fname = match.match(/^['"]{0,1}(.+?)['"]{0,1}$/)[1];
  const fname = match.substring(1, match.length - 1);
  const isExample = fs.existsSync(path.posix.join('@CMAKE_CURRENT_BINARY_DIR@', 'src/examples', fname));
  const isWorker = fs.existsSync(path.posix.join('@CMAKE_CURRENT_BINARY_DIR@', 'src/examples/workers', fname))
  if (isExample) {
    return `require(\"./${path.normalize(fname)}\")`;
  } else if (isWorker) {
    return `require(\"./${path.normalize(fname)}\")`;
  } else {
    return match;
  }
}

const examples = {
  'examples/windowDemo': path.posix.join('@CMAKE_CURRENT_SOURCE_DIR@', 'src/examples/windowDemo/main'),
  'examples/noiseDemo': path.posix.join('@CMAKE_CURRENT_SOURCE_DIR@', 'src/examples/noiseDemo/main'),
};

module.exports = {
  entry: examples,
  output: {
    filename: '[name].js',
    path: path.join('@CMAKE_CURRENT_SOURCE_DIR@', 'dist', suffix),
  },
  module: {
    rules: [
      {
        test: new RegExp(`workers${path.sep == '\\' ? '\\\\' : path.sep}.+\.js$`),
        use: [
          {
            loader: 'file-loader',
            options: {
              name: file => path.posix.format(path.parse(path.relative(path.join(__dirname, 'src'), file))),
              publicPath: '../',
              outputPath: './',
            },
          },
          {
            loader: 'nested-require-loader',
            options: {
              rawString: false,
            },
          },
        ]
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: StringReplacePlugin.replace({
              replacements: [
                {
                  pattern: /['"]{0,1}\w+(\.wasm|\.js.mem)['"]{0,1}/g,
                  replacement: replaceWithRequire,
                },
              ],
            }),
          },
        ],
      },
      {
        test: /(\.wasm$)|(\.js\.mem$)/,
        loader: 'file-loader',
        options: {
          name: file => path.posix.format(path.parse(path.relative(path.join(__dirname, 'src'), file))),
          publicPath: '../',
          outputPath: './',
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
      template: path.posix.join('@CMAKE_CURRENT_SOURCE_DIR@', 'src/examples/template.ejs'),
      chunks: [ chunk ],
    })
  ))),
  node: {
    fs: 'empty',
  },
}
