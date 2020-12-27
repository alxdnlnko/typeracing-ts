'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isDevelopment = process.env.NODE_ENV === 'development'


module.exports = {
  mode: 'development',
  devtool: 'source-map',

  devServer: {
    contentBase: './dist',
    clientLogLevel: 'info',
    host: '0.0.0.0',
    port: 8001,
    allowedHosts: [ ],
    inline: true,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 500,
    },
    writeToDisk: true,
  },

  context: path.join(process.cwd(), 'src'),

  entry: 'index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },

  resolve: {
    modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
    extensions: [ '.js', '.jsx', '.ts', '.tsx', '.scss' ],
  },

  module: {
    rules: [
      {
	test: /\.tsx?$/,
	loader: 'ts-loader',
      },

      {
        test: /\.svg$/,
        loader: '@svgr/webpack',
        options: { icon: true, typescript: false },
      },

      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: isDevelopment
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: 'index.html',
    }),

    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[hash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[hash].css'
    })
  ]
}
