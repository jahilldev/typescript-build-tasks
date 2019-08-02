import webpack from 'webpack';
import log from 'fancy-log';
import { config } from '../../../webpack.config';

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const WATCH = process.argv.includes('--watch');

/* -----------------------------------
 *
 * Handler
 *
 * -------------------------------- */

function handler(err: Error, stats: webpack.Stats) {
   if (err) {
      log.error(err);
   }

   log.info(
      stats.toString({
         colors: true,
         children: false,
      })
   );
}

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

const build = () =>
   new Promise(resolve => {
      const compiler = webpack(config);

      if (WATCH) {
         compiler.watch(null, handler);
      } else {
         compiler.run(handler);
      }

      resolve();
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default build;
