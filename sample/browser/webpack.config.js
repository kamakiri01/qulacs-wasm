/** @type {import("webpack").Configuration} */
module.exports = {
    entry: {
      "main": "./lib/index.js",
      "calculate.worker": "./lib/calculate.worker.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
        },
        // @see https://zenn.dev/wok/articles/0022_bundle-wasm
        { test: /\.wasm$/, type: "asset/inline" },
      ],
    },
    // @see https://stackoverflow.com/questions/59487224/webpack-throws-error-with-emscripten-cant-resolve-fs
    resolve: {
        fallback: {
        fs: false,
        path: false,
        crypto: false,
        }
    },
    mode: "development",
};
