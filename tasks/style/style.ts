import chalk from 'chalk';
import log from 'fancy-log';
import { IConfig } from '../config';
import targets from './targeted/targets';
import buildStyles from './build/build';
import styleWatch from './watch/watch';
import { IBaseStyleOptions, ITarget, Builds } from './style.d';

/* -----------------------------------
 *
 * Default Target
 *
 * -------------------------------- */

const defaultTarget: ITarget = {
   variety: 'default',
   colour: 'black',
   background: 'bgWhite',
};

/* -----------------------------------
 *
 * Critical Target
 *
 * -------------------------------- */

const criticalTarget: ITarget = {
   variety: 'critical',
   colour: 'black',
   background: 'bgMagenta',
};

/* -----------------------------------
 *
 * Async Target
 *
 * -------------------------------- */

const asyncTarget: ITarget = {
   variety: 'async',
   colour: 'black',
   background: 'bgCyan',
};

/* -----------------------------------
 *
 * Style Builder
 *
 * -------------------------------- */

async function styleBuilder(styleOptions: IBaseStyleOptions) {
   const { contextLog } = styleOptions;
   const builds: Builds = new Map();

   try {
      const entryPoints = await targets(styleOptions);

      if (entryPoints.size) {
         for (const [entryPoint, options] of entryPoints) {
            const result = await buildStyles(options);

            builds.set(entryPoint, {
               ...result,
               build: buildStyles,
            });
         }
      }
   } catch (err) {
      contextLog(err);
   }

   return Promise.all(builds)
      .catch(err => {
         contextLog(err);
      })
      .then(() => {
         if (process.argv.includes('--watch')) {
            styleWatch(builds);
         } else {
            process.exitCode = 0;
         }
      });
}

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

function style(target: ITarget) {
   return (config: IConfig) =>
      styleBuilder({
         config,
         target,
         get contextLog() {
            const { background, colour, variety } = this.target;
            const label = chalk`{${colour}.bold.${background}  ${variety.toUpperCase()} }`;

            return (...messages: any[]) => {
               for (const message of messages) {
                  log(label, message);
               }
            };
         },
      });
}

const asyncStyle = style(asyncTarget);
const criticalStyle = style(criticalTarget);
const defaultStyle = style(defaultTarget);

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { asyncStyle, criticalStyle, defaultStyle };
