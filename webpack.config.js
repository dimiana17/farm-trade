const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // Ensures Webpack builds for a Node.js environment
  plugins: [
    // Ignores .node files during the Webpack build
    new webpack.IgnorePlugin({
      resourceRegExp: /\.node$/,
    }),
  ],
  externals: [
    nodeExternals(),
    {
      '@napi-rs/snappy': 'commonjs @napi-rs/snappy', // Use the commonjs version
    },
  ],
  resolve: {
    fallback: {
      // Provides browser-compatible shims for Node.js modules
      http: require.resolve('stream-http'),
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      vm: require.resolve('vm-browserify'),
      querystring: require.resolve('querystring-es3'),
      os: require.resolve('os-browserify/browser'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  node: {
    // Ensures Webpack does not override Node-specific global variables
    __dirname: false,
    __filename: false,
  },
  ignoreWarnings: [
    {
      module: /@mongodb-js|snappy/, // Ignores warnings for specific modules
    },
  ],
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      // other rules
    ],
  },
  // Other configurations like entry and output should go here
};
