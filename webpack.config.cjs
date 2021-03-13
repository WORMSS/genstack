const { resolve } = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [resolve(__dirname, 'src')]
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
    library: "IterateStack"
  },
  target: "es2020"
};