// webpack.renderer.config.js
const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// Add JSX support
rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-react', '@babel/preset-env']
    }
  }
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
};