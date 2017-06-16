module.exports = {
  entry: './index.ts',
  output: {
    filename: 'dist/main.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
};
