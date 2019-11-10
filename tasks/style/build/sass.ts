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
      sass.render(options, function(err, result) {
         err
            ? reject(err)
            : resolve({
                 ...result,
                 fileName: this.options.outFile,
              });
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
   const { input, output, flags, config, contextLog } = options;

   const sassOptions = {
      file: input,
      includePaths: config.scss.includePaths,
      outFile: output,
      outputStyle: config.scss.outputStyle,
      sourceMap: 'DEBUG' in flags && flags.DEBUG,
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
            contextLog(chalk`{yellow ⚠ SASS Warn} ${msg.getValue()}`);
            return sass.NULL;
         },
      },
   };

   try {
      const result = await sassRender(sassOptions);
      const { css, stats, map, fileName } = result;

      if (stats) {
         contextLog(
            chalk`🛠  Built entry point: {yellow ${
               stats.entry
            }} in {yellow ${stats.duration.toString()}}ms`
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
      contextLog(err);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default sassBuild;
