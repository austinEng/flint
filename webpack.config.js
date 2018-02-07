const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
  const context = path.resolve(__dirname, env.root);

  const examples = {
    'examples/windowDemo': path.posix.join(__dirname, 'src/examples/windowDemo/main'),
    'examples/noiseDemo': path.posix.join(__dirname, 'src/examples/noiseDemo/main'),
    'examples/terrainDemo': path.posix.join(__dirname, 'src/examples/terrainDemo/main'),
  };

  function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(function(file) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        walk(filePath);
      } else {
        const ext = path.extname(filePath);
        if (ext === '.wasm' || ext === '.mem') {
          const newFile = path.posix.join(__dirname, 'dist', env.suffix, path.relative(path.join(context, 'src'), filePath));
          fs.copySync(filePath, newFile);
        }
      }
    });
  }

  walk(path.join(context, 'src'));

  return {
    entry: examples,
    output: {
      filename: '[name].js',
      path: path.posix.join(__dirname, 'dist', env.suffix),
    },
    module: {
      rules: [
        {
          test: new RegExp(`workers${path.sep == '\\' ? '\\\\' : path.sep}.+\.js$`),
          use: [
            {
              loader: 'file-loader',
              options: {
                name: file => path.posix.format(path.parse(path.relative(path.join(context, 'src'), file))),
                publicPath: '../',
                outputPath: './',
              },
            },
          ]
        },
        {
          test: /(\.wasm$)|(\.js\.mem$)/,
          loader: 'file-loader',
          options: {
            name: file => path.posix.format(path.parse(path.relative(path.join(context, 'src'), file))),
            publicPath: '../',
            outputPath: './',
          },
        },
      ],
    },
    resolve: {
      modules: [
        path.join(context, 'src'),
        'node_modules',
      ],
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
    ].concat(Object.keys(examples).map(chunk => (
      new HtmlWebpackPlugin({
        title: path.basename(chunk),
        filename: `${chunk}.html`,
        template: path.posix.join(__dirname, 'src', 'examples', 'template.ejs'),
        chunks: [ chunk ],
      })
    ))),
    node: {
      fs: 'empty',
    },
  };
}
