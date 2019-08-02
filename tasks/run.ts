import log from 'fancy-log';
import chalk from 'chalk';

/* -----------------------------------
 *
 * Run
 *
 * -------------------------------- */

function run(method: any, options?: any) {
   const task = typeof method.default === 'undefined' ? method : method.default;
   const start = new Date();

   log.info(
      `Running: ${chalk.blue(task.name)} ${options ? `(${options})` : ''}...`
   );

   return task(options).then((resolution: any) => {
      const end = new Date();
      const time = end.getTime() - start.getTime();

      log.info(
         `Finished: ${chalk.blue(task.name)} ${
            options ? `(${options})` : ''
         } after ${time} ms`
      );

      return resolution;
   });
}

if (require.main === module && process.argv.length > 2) {
   delete require.cache[__filename];

   const module = require(`./${process.argv[2]}.ts`).default;

   run(module).catch((err: any) => {
      log.error(err.stack);
      process.exit(1);
   });
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default run;
