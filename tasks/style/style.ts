import chalk from 'chalk';
import log from 'fancy-log';
import targets from './targeted/targets';
import buildStyles from './build/build';
import styleWatch from './watch/watch';
import { config } from '../config';
import { IFlags, IBaseStyleOptions, Builds } from './style.d';

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const flags: IFlags = {
   DEBUG: process.argv.includes('--debug'),
   LINT: process.argv.includes('--lint'),
   RELEASE: process.argv.includes('--release'),
   WATCH: process.argv.includes('--watch'),
};

/* -----------------------------------
 *
 * Base Style Options
 *
 * -------------------------------- */

const baseStyleOptions: IBaseStyleOptions = {
   target: 'default',
   flags,
   config,
   get contextLog() {
      const label = chalk`{black.bold.bgWhite  ${this.target.toUpperCase()} }`;

      return (...messages: any[]) => {
         for (const message of messages) {
            log(label, message);
         }
      };
   },
};

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

function defaultStyle() {
   return new Promise(async (resolve, reject) => {
      const { contextLog } = baseStyleOptions;

      try {
         const builds: Builds = new Map();
         const entryPoints = await targets(baseStyleOptions);

         if (entryPoints.size) {
            for (const [entryPoint, options] of entryPoints) {
               const result = await buildStyles(options);

               builds.set(entryPoint, {
                  ...result,
                  build: buildStyles,
               });
            }

            Promise.all(builds).then(() => {
               if ('WATCH' in flags && flags.WATCH) {
                  styleWatch(builds);
               }

               resolve();
            });
         }
      } catch (err) {
         reject(contextLog(err));
      }
   });
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default defaultStyle;
