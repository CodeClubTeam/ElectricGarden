const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  target: 'node',
  entry: {
    'init-db': './src/init-db.ts',
    'sync-sensor-stats': './src/sync-sensor-stats.ts',
    'copy-points': './src/copy-points.ts',
    'copy-orgs': './src/copy-orgs.ts',
    'copy-manufacture': './src/copy-manufacture.ts',
    'adhoc': "./src/adhoc.ts"
  },
  module: {
    rules: [
      {
        test: /\.ya?ml$/,
        type: 'json', // Required by Webpack v4
        use: 'yaml-loader'
      },
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  },
  resolve: {
    extensions: [".yaml", ".ts", ".js"]
  },
  output: {
    filename: '[name].js',
    path: path.resolve('./scripts'),
  },
};
