const path = require('path');
const SizePlugin = require('size-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'potree.js',
    library: 'potree',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devtool: 'cheap-eval-source-map',
  stats: 'errors-only',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css'],
  },
  externals: ['three'],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: { inline: true, fallback: false },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },

      { test: /\.(vs|fs|glsl|vert|frag)$/, loader: 'raw-loader' },
	  {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  plugins: [new SizePlugin()],
};
