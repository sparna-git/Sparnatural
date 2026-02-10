const webpack = require("webpack");
const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = {
  entry: {
    sparnatural: ["./src/SparnaturalElement.ts", "./scss/sparnatural.scss"],
  },
  output: {
    path: path.resolve(__dirname, "./dist/browser"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
          },
        ],
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
              // Convert images < 8kb to base64 strings
              // in case larger images are processed by file-loader
              name: "images/[hash]-[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    fallback: {
      util: require.resolve("util/"),
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      querystring: require.resolve("querystring-es3"),
      url: require.resolve("url/"),
      crypto: false,
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "dev-page/index.html", // Pour la page principale
      template: __dirname + "/dev-page/index.html",
      inject: false,
      templateParameters: (compilation, assets) => {
        const css = assets.css
          .map((filePath) => `<link rel="stylesheet" href="${filePath}" />`)
          .join("\n");
        const js = assets.js
          .map((filePath) => `<script src="${filePath}"></script>`)
          .join("\n");
        return { css, js };
      },
    }),
    new HtmlWebpackPlugin({
      filename: "dev-page/form-page.html", // Utiliser un nom différent pour la nouvelle page
      template: __dirname + "/dev-page/form-page.html",
      inject: false,
      templateParameters: (compilation, assets) => {
        const css = assets.css
          .map((filePath) => `<link rel="stylesheet" href="${filePath}" />`)
          .join("\n");
        const js = assets.js
          .map((filePath) => `<script src="${filePath}"></script>`)
          .join("\n");
        return { css, js };
      },
    }),

    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + "/dev-page",
          to: __dirname + "/dist" + "/dev-page",
          globOptions: {
            ignore: ["**/index.html", "**/form-page.html"], // Assure-toi de ne pas copier ces fichiers déjà générés
          },
        },
      ],
    }),

    new DashboardPlugin(),
    // so that JQuery is automatically inserted
    // see https://stackoverflow.com/a/28989476
    // this will automatically add a "require("jquery")" everytime the jQuery or & symbol are encountered
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
    // so that stream works properly, necessary for RDFSpec provider
    // see https://stackoverflow.com/questions/68542553/webpack-5process-is-not-defined-triggered-by-stream-browserify
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new FileManagerPlugin({
      events: {
        onEnd: [
          // Copy the themes CSS directly as static files in a themes subfolder
          {
            copy: [
              {
                source: "./scss/themes/*",
                destination: "./dist/themes",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./hello-sparnatural/**",
                destination: "./dist/hello-sparnatural",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.js",
                destination: "./dist/hello-sparnatural/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.css",
                destination: "./dist/hello-sparnatural/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.js.map",
                destination: "./dist/hello-sparnatural/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.css.map",
                destination: "./dist/hello-sparnatural/",
                options: { overwrite: true },
              },
            ],
          },
          {
            archive: [
              {
                source: "./dist/hello-sparnatural",
                destination: "./dist/hello-sparnatural.zip",
              },
            ],
          },
          {
            delete: ["./dist/hello-sparnatural"],
          },
          // sparnatural-starter folder
          {
            copy: [
              {
                source: "./sparnatural-starter/**",
                destination: "./dist/sparnatural-starter",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.js",
                destination: "./dist/sparnatural-starter/js/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.css",
                destination: "./dist/sparnatural-starter/css/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.js.map",
                destination: "./dist/sparnatural-starter/js/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/sparnatural.css.map",
                destination: "./dist/sparnatural-starter/css/",
                options: { overwrite: true },
              },
            ],
          },
          {
            archive: [
              {
                source: "./dist/sparnatural-starter",
                destination: "./dist/sparnatural-starter.zip",
              },
            ],
          },
          {
            delete: ["./dist/sparnatural-starter"],
          },
          {
            copy: [
              {
                source: "./src/sparnatural-bindings.js",
                destination: "./dist/",
                options: { overwrite: true },
              },
            ],
          },
        ],
      },
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./dev-page"),
    },
    historyApiFallback: true,
    hot: true,
    open: ["/dev-page"],
  },
  devtool: "source-map",
};
