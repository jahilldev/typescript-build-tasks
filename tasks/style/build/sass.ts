import path from 'path';
import sass, { Result as SASSResult } from 'node-sass';
import chalk from 'chalk';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface ISASSOptions {
   file: string;
   functions?: any;
   includePaths: string[];
   outFile: string;
   outputStyle: 'compact' | 'compressed' | 'expanded' | 'nested';
   sourceMap: boolean;
}

interface IResult extends SASSResult {
   fileName: string;
}

/* -----------------------------------
 *
 * Process
 *
 * -------------------------------- */

function sassRender(options: ISASSOptions): Promise<IResult> {
   return new Promise((resolve, reject) => {
      let result;

      try {
         result = sass.renderSync(options);
      } catch (err) {
         reject(err);
      }

      resolve({
         ...result,
         fileName: options.outFile,
      });
   });
}

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

async function sassBuild(
   options: IStyleOptions
): Promise<IStyleOptions> {
   const { input, output, config, contextLog } = options;

   const sassOptions = {
      file: input,
      includePaths: config.scss.includePaths,
      outFile: output,
      outputStyle: config.scss.outputStyle,
      sourceMap: process.argv.includes('debug'),
      functions: {
         '@debug'(msg: any) {
            contextLog(chalk`{blue ℹ  SASS Debug} ${msg.getValue()}`);
            return sass.NULL;
         },
         '@error'(msg: any) {
            contextLog(chalk`{red ❌ SASS Error} ${msg.getValue()}`);
            return sass.NULL;
         },
         '@warn'(msg: any) {
            contextLog(
               chalk`{yellow ⚠  SASS Warn} ${msg.getValue()}`
            );
            return sass.NULL;
         },
      },
   };

   try {
      const result = await sassRender(sassOptions);
      const { css, stats, map, fileName } = result;

      if (stats) {
         const entryPoint = path.relative(
            path.resolve(process.cwd(), config.path.style),
            stats.entry
         );
         const duration = stats.duration;
         let durationColour = 'greenBright';

         if (duration >= 25) {
            durationColour =
               duration >= 50 ? 'redBright' : 'yellowBright';
         }

         contextLog(
            chalk`🛠 Built SASS entry point:{yellow ${entryPoint}} in {${durationColour} %dms}`,
            duration
         );
      }

      Object.assign(options, {
         input: stats.entry,
         fileName,
         css: css.toString(),
         map: map && map.toString(),
      });

      return options;
   } catch (err) {
      contextLog(err.message, err.stack);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default sassBuild;
