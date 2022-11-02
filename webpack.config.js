const webpack = require("webpack");
const path = require("path");
const WriteFilePlugin = require('write-file-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // mode:'development',
  entry: ["./src/SparnaturalElement.ts" ],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "sparnatural.js"
  },
  module: {
    rules: [
	  	{
			 test: /\.(js|jsx)$/,
			 exclude: /node_modules/,
			 use: { loader: "babel-loader" }
	  	},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
	    {
				test: /\.(sass|scss)$/,
				use: [
				{ 
					loader: MiniCssExtractPlugin.loader
				},
				{
				    loader: "css-loader", // translates CSS into CommonJS
					options: {
						sourceMap: true,
					}
				}, 
				{
				    loader: "sass-loader" // compiles Sass to CSS
				}
				]
			},
	    {
				test: /\.css$/,
				use: [
				{ 
					loader: MiniCssExtractPlugin.loader
				},
				{
				    loader: "css-loader" // translates CSS into CommonJS
				}
				]
			},
	    {
	        test: /\.(png|jp(e*)g|svg|gif)$/,
	        use: [{
	            loader: 'url-loader',
	            options: { 
	                limit: 8000,
	                // Convert images < 8kb to base64 strings
	                // in case larger images are processed by file-loader
	                name: 'images/[hash]-[name].[ext]'
	            } 
	        }]
	    }
    ] // end rules
  },
  resolve: {
		fallback:{
			"util": require.resolve('util/'),
			"buffer": require.resolve('buffer/'),
			"stream": require.resolve("stream-browserify"),
			"querystring": require.resolve("querystring-es3"),
			"url": require.resolve("url/")
		},
	  extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
		new WriteFilePlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: __dirname + "/static/demo-dpedia/index.html",
			inject: 'body'
		}),
		new MiniCssExtractPlugin({
		  filename: "sparnatural.css",
		  chunkFilename: "[id].css"
		}),
		new CopyPlugin({
		  patterns: [
			{from:__dirname +'/static'}
		  ]
		}),
		new DashboardPlugin(),
		// so that JQuery is automatically inserted
		new webpack.ProvidePlugin({
		  $: 'jquery',
		  jQuery: 'jquery',
		})
  ],
	devServer: {
		static:{
			directory: path.resolve(__dirname, "./dist"),
		},
		historyApiFallback: true,
		open: true,
		hot: true
	},
  devtool: "source-map"
}
