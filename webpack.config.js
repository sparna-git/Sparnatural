const webpack = require("webpack");
const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: "./src/sparnatural.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./sparnatural.js"
  },
  module: {
    rules: [
    	{
			test: /\.(js|jsx)$/,
			exclude: /node_modules/,
			use: { loader: "babel-loader" }
    	},
    	{
			test: /\.(sass|scss)$/,
			use: [
			{ 
				loader: MiniCssExtractPlugin.loader
			},
			{
			    loader: "css-loader" // translates CSS into CommonJS
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
                    limit: 8000, // Convert images < 8kb to base64 strings
                    // in case larger images are processed by file-loader
                    name: 'images/[hash]-[name].[ext]'
                } 
            }]
        }
    ]
  },
  plugins: [
  	new HtmlWebpackPlugin({
          template: __dirname + "/src/index.html",
          inject: 'body'
    }),
	new MiniCssExtractPlugin({
	  filename: "sparnatural.css",
	  chunkFilename: "[id].css"
	}),
	new CopyPlugin([
      { from: 'static' }
    ]),
	new DashboardPlugin()
  ],
	devServer: {
	  contentBase: path.resolve(__dirname, "./dist"),
	  historyApiFallback: true,
	  inline: true,
	  open: true,
	  hot: true
	},
	devtool: "eval-source-map"
}
