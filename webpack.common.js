const path = require('path');
const webpack = require("webpack");
const PolyfillInjectorPlugin = require('webpack-polyfill-injector');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DotEnv = require("dotenv-webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  resolve: {
    alias: {
        'node_modules': path.join(__dirname, 'node_modules'),
        'bower_modules': path.join(__dirname, 'bower_modules'),
    }
  },
  entry: {
      'jquery.thiss.ds-widget': ['./src/ds-widget.js'],
      'demo': ['./src/demo.js'],
  },
  externals: {
    jquery: 'jQuery'
  },
  node: {
      console: false,
      global: true,
      process: true,
      __filename: 'mock',
      __dirname: 'mock',
      Buffer: false,
      setImmediate: true
  },
  plugins: [
      new DotEnv({systemvars: true}),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
          filename: 'index.html',
          inject: true,
          chunks: ['demo'],
          template: '!ejs-loader!src/index.html'
      }),
      new MiniCssExtractPlugin({
            filename: "[name].css"
      }),
  ],
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: "/",
      libraryTarget: 'umd',
      library: 'thiss',
      globalObject: 'this'
  },
  module: {
     rules: [
         {
                test: /\.(css)$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader']
         },
         {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                }
            }
       }
     ]
   }
};
