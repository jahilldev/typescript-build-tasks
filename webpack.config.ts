import { Configuration, DefinePlugin } from 'webpack';
import * as path from 'path';
import * as fs from 'fs';
import { config as asset } from './tasks/config';

/* -----------------------------------
 
 * Flags
 *
 * -------------------------------- */

const RELEASE = process.argv.includes('--release');

/* -----------------------------------
 *
 * Webpack
 *
 * -------------------------------- */

const config: Configuration = {
   entry: __dirname + '/src/client.ts',
   mode: RELEASE ? 'production' : 'development',
   target: 'node',
   externals: fs.readdirSync('node_modules'),
   context: path.join(__dirname, './src'),
   cache: true,
   output: {
      path: __dirname + '/dist',
      filename: 'client.js',
      publicPath: '/',
      libraryTarget: 'commonjs2',
   },
   resolve: {
      extensions: ['.ts', 'json'],
      alias: {
         _: path.resolve(__dirname, `./${asset.path.src}`),
      },
   },
   node: {
      __filename: false,
      __dirname: false,
   },
   module: {
      rules: [
         {
            test: /\.ts?$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            options: {
               fix: true,
            },
         },
         {
            test: /\.ts?$/,
            use: [
               {
                  loader: 'ts-loader',
               },
            ],
         },
      ],
   },
   plugins: [
      new DefinePlugin({
         __DEV__: !RELEASE,
      }),
   ],
   stats: {
      colors: true,
      timings: true,
   },
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { config };
