const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    http: '../../funcs/http/out/index.js',
    'point-inserter': '../../funcs/point-inserter/index.js',
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'pack'),
    libraryTarget: 'commonjs2',
  },
  node: {
    __dirname: false,
  },
};
