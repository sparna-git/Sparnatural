const webpack = require("webpack");
const path = require("path");
const fs = require("fs");
const WriteFilePlugin = require("write-file-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyPlugin = require("copy-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const { LicenseWebpackPlugin } = require("license-webpack-plugin");

// Scope-hoisted modules are not all discovered by the license plugin. Include
// the optional integration's runtime dependency tree explicitly in its notices.
function ldforgeLicenseModules() {
  const modules = new Map();
  function visit(name, from = __dirname) {
    let current = from;
    let directory;
    while (true) {
      const candidate = path.join(current, "node_modules", name);
      if (fs.existsSync(path.join(candidate, "package.json"))) {
        directory = candidate;
        break;
      }
      const parent = path.dirname(current);
      if (parent === current) throw new Error(`Cannot locate license metadata for ${name}`);
      current = parent;
    }
    if (modules.has(directory)) return;
    modules.set(directory, { name, directory });
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
    Object.keys(manifest.dependencies || {}).forEach(dependency => visit(dependency, directory));
  }
  ["@ldforge/core", "@ldforge/editor", "@ldforge/renderers", "@ldforge/geo", "@ldforge/charts"].forEach(name => visit(name));
  return [...modules.values()];
}

module.exports = (_env, argv = {}) => ({
  entry: {
    sparnatural: ["./src/SparnaturalElement.ts", "./scss/sparnatural.scss"],
    "sparnatural-ldforge": {
      import: [
        "@ldforge/editor/styles.css",
        "./scss/sparnatural-ldforge.scss",
        "./src/integrations/ldforge/index.ts",
      ],
      library: { name: "SparnaturalLDForge", type: "umd" },
    },
  },
  output: {
    path: path.resolve(__dirname, "./dist/browser"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        // Explicit host loaders below replace the Vite-specific dynamic imports.
        test: /node_modules[\\/]@ldforge[\\/](geo|charts)[\\/]dist[\\/].*\.js$/,
        parser: { exprContextCritical: false },
      },
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
    ...(argv.mode === "production" ? [new LicenseWebpackPlugin({
      perChunkOutput: false,
      outputFilename: "sparnatural-third-party.js.LICENSE.txt",
      addBanner: true,
      additionalModules: ldforgeLicenseModules(),
    })] : []),
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
      process: "process/browser.js",
    }),
    // Archive only production output; the persistent dev server must not rewrite release ZIPs.
    ...(argv.mode === "production" ? [new FileManagerPlugin({
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
                source: "./dist/browser/*.js*",
                destination: "./dist/hello-sparnatural/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/*.css*",
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
                source: "./dist/browser/*.js*",
                destination: "./dist/sparnatural-starter/assets/js/",
                options: { overwrite: true },
              },
            ],
          },
          {
            copy: [
              {
                source: "./dist/browser/*.css*",
                destination: "./dist/sparnatural-starter/assets/css/",
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
    })] : []),
  ],
  devServer: {
    client: { overlay: { errors: true, warnings: false } },
    static: {
      directory: path.resolve(__dirname, "./dev-page"),
      publicPath: ["/", "/dev-page"],
    },
    historyApiFallback: true,
    hot: true,
    open: ["/dev-page"],
  },
  devtool: "source-map",
});
