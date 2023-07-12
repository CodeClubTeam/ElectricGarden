const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const getFuncPath = (subPath) => {
  return `../../funcs/${subPath}`;
};
// see the device-hq version for a far easier to maintain approach
module.exports = {
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  entry: {
    // ingest
    catm1: getFuncPath('ingest/catm1/out/index.js'),
    'webhooks-stripe': getFuncPath('ingest/webhooks-stripe/out/index.js'),
    'sample-receiver': getFuncPath('ingest/sample-receiver'),
    'ping': getFuncPath('ingest/ping'),
    'device-inactivity': getFuncPath('ingest/device-inactivity/out/index.js'),

    // app
    appapi: getFuncPath('http/appapi/out/server.js'),

    // provisioner
    provisioner: getFuncPath('provisioner/out/index.js'),

    // shop api
    shopapi: getFuncPath('shop/shopapi/out/server.js'),
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'pack'),
    libraryTarget: 'commonjs2', 
  },
  node: {
    __dirname: false,
  },
  plugins: [
    // see https://github.com/node-formidable/formidable/issues/452
    // formidable is weird dep of auth0 dep that needs this workaround
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          keep_classnames: true, // breaks mongoose if this is off
          keep_fnames: true,

          output: {
            comments: false,
          },
        },
      }),
    ],
  },
};
