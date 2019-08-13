import globby from 'globby';
import log from 'fancy-log';
import { writeFile, styleOutFile } from '../utility';
import dependencyGraph, {
   IImportDependencies,
} from './graph/dependency';
import styleLint from './lint/lint';
import sassBuild from './build/sass';
import postcssBuild from './build/postcss';
import styleWatch from './watch/watch';
import { config } from '../config';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface IFlags {
   [key: string]: boolean;
}

export interface IStyleOptions {
   input: string;
   output: string;
   css?: string;
   map?: string;
   dependencies?: IImportDependencies;
   flags: IFlags;
   config: any;
}

export interface IEntryPointOptions {
   [entryPoint: string]: IStyleOptions;
}

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const flags: IFlags = {
   DEBUG: process.argv.includes('--debug'),
   LINT: process.argv.includes('--lint'),
   WATCH: process.argv.includes('--watch'),
};

const buildStyles = async (entryPoint: string) => {
   const styleOptions: IStyleOptions = {
      input: entryPoint,
      output: styleOutFile(entryPoint),
      flags,
      config,
   };

   let result = await dependencyGraph(styleOptions);

   if ('LINT' in flags && flags.LINT) {
      result = await styleLint(result);
   }

   result = await sassBuild(result);
   result = await postcssBuild(result);

   try {
      writeFile(result.output, result.css);
   } catch (err) {
      log.error(err);
   }

   if (result.map) {
      try {
         writeFile(result.output + '.map', result.map);
      } catch (err) {
         log.error(err);
      }
   }

   return result;
};

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

const style = () =>
   new Promise(async resolve => {
      let entryPoints;

      try {
         entryPoints = await globby(config.style.entryPoints);
      } catch (err) {
         return log.error(err);
      }

      const builds = entryPoints.map(buildStyles);
      const entryPointOptions: IEntryPointOptions = {};

      builds.map(async build => {
         try {
            const result = await build;
            entryPointOptions[result.input] = result;
         } catch (err) {
            return log.error(err);
         }
      });

      Promise.all(builds).then(() => {
         if ('WATCH' in flags && flags.WATCH) {
            styleWatch(entryPointOptions, buildStyles);
         }

         resolve();
      });
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default style;
