import globby from 'globby';
import log from 'fancy-log';
import { writeFile, styleOutFile } from '../utility';
import styleLint from './lint/lint';
import sassBuild from './build/sass';
import postcssBuild from './build/postcss';
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
   flags: IFlags;
   config: any;
}

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const flags: IFlags = {
   DEBUG: process.argv.includes('--debug'),
   LINT: process.argv.includes('--lint'),
};
/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

const buildStyles = () =>
   new Promise(async resolve => {
      let entryPoints;

      try {
         entryPoints = await globby(config.style.entryPoints);
      } catch (err) {
         return log.error(err);
      }

      const builds = entryPoints.map(async (entryPoint: string) => {
         const styleOptions: IStyleOptions = {
            input: entryPoint,
            output: styleOutFile(entryPoint),
            flags,
            config,
         };

         let result;

         if ('LINT' in flags && flags.LINT) {
            result = await styleLint(styleOptions);
         }

         result = await sassBuild(result || styleOptions);
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
      });

      Promise.all(builds).then(resolve);
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default buildStyles;
