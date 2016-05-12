'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

function getEntries() {
  const dir = path.join(__dirname, 'web', 'resources', 'assets', 'javascript');
  let res = {};
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const extname = path.extname(file);

    if (extname === '.js') {
      const basename = path.basename(file, extname);
      res[basename] = path.join(dir, basename);
    }
  });
  return res;
}

var config = {
  entry: getEntries(),
  output: {
    path: path.join(__dirname, 'web', 'public', 'javascript'),
    filename: '[name].js'
  },
  externals: {
  },
  module: {
    loaders: [
      {
        test: /\.js|\.jsx$/,
        loader: 'jsx-loader?harmony'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
};

module.exports = config;
