import path from 'path';
import chokidar from 'chokidar';
import chalk from 'chalk';
import log from 'fancy-log';
import { IEntryPointOptions, IStyleOptions } from '../style';
import dependencyGraph, {
   IImportDependencies,
} from '../graph/dependency';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface IWatchInternal {
   options: IEntryPointOptions;
   currentEntryPoint?: string;
   readonly entryPoints: string[];
   dependencies: IImportDependencies;
}

/* -----------------------------------
 *
 * Watch
 *
 * -------------------------------- */

const styleWatch = async (
   options: IEntryPointOptions,
   buildSteps: (entryPoint: string) => Promise<IStyleOptions>
) => {
   const internal: IWatchInternal = {
      options,
      get entryPoints() {
         return Object.keys(this.options);
      },
      get dependencies() {
         if (!this.currentEntryPoint) {
            throw Error(
               `'internal.currentEntryPoint' must be set in order to access the entryPoint's dependencies`
            );
         }
         return this.options[this.currentEntryPoint].dependencies;
      },
      set dependencies(value) {
         if (!this.currentEntryPoint) {
            throw Error(
               `'internal.currentEntryPoint' must be set in order to access the entryPoint's dependencies`
            );
         }
         this.options[this.currentEntryPoint].dependencies = value;
      },
   };

   chokidar
      .watch('./src/style', { ignoreInitial: true })
      .on('error', error =>
         log.error(chalk`{red 🔍 Watcher Error: ${error.toString()}}`)
      )
      .on('all', async (event: string, eventPath: string) => {
         log.info(
            chalk`{bgBlue.black.bold ${event.toUpperCase()}} event detected at {yellow ${eventPath}}`
         );

         for (const entryPoint of internal.entryPoints) {
            internal.currentEntryPoint = entryPoint;
            if (event.toLowerCase().match(/add(?:dir)?/)) {
               const graphResult = await dependencyGraph(
                  internal.options[internal.currentEntryPoint]
               );
               internal.dependencies = graphResult.dependencies;
            }

            if (
               Object.keys(internal.dependencies).includes(
                  path.resolve(process.cwd(), eventPath)
               )
            ) {
               buildSteps(entryPoint);
            }

            if (event.toLowerCase().match(/unlink(?:dir)?/)) {
               const graphResult = await dependencyGraph(
                  internal.options[internal.currentEntryPoint]
               );
               internal.dependencies = graphResult.dependencies;
            }
         }
      });
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleWatch;
