import path from 'path';
import chokidar from 'chokidar';
import chalk from 'chalk';
import log from 'fancy-log';
import { Builds } from '../style.d';
import dependencyGraph from '../graph/dependency';

/* -----------------------------------
 *
 * Watcher
 *
 * -------------------------------- */

const watchedBuilds: Builds = new Map();

chokidar
   .watch('./src/style', { ignoreInitial: true })
   .on('error', error =>
      log.error(chalk`{red 🔍 Watcher Error: ${error.toString()}}`)
   )
   .on('all', async (event: string, eventPath: string) => {
      log.info(
         chalk`{bgBlue.black.bold  ${event.toUpperCase()} } Event detected at {yellow ${eventPath}}`
      );

      for (const [entryPoint, watchedBuild] of watchedBuilds) {
         const { build, ...options } = watchedBuild;

         try {
            if (event.toLowerCase().match(/add(?:dir)?/)) {
               const graphResult = await dependencyGraph(options);

               options.dependencies = graphResult.dependencies;
            }

            if (
               options.dependencies.has(
                  path.resolve(process.cwd(), eventPath)
               )
            ) {
               options.contextLog(
                  chalk`{bgGreen.black.bold  TRIGGER } Building entryPoint: {yellow ${entryPoint}}`
               );
               build(options);
            }

            if (event.toLowerCase().match(/unlink(?:dir)?/)) {
               const graphResult = await dependencyGraph(options);

               options.dependencies = graphResult.dependencies;
            }
         } catch (err) {
            options.contextLog(err);
         }
      }
   });

/* -----------------------------------
 *
 * Watch
 *
 * -------------------------------- */

async function styleWatch(builds: Builds) {
   for (const build of builds) {
      watchedBuilds.set(...build);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleWatch;
