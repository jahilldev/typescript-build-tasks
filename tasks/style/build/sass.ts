import sass, { Result as SASSResult } from 'node-sass';
import chalk from 'chalk';
import log from 'fancy-log';
import { IStyleOptions } from '../style';

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

const sassRender = (options: ISASSOptions): Promise<IResult> => {
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
};

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

const sassBuild = async (
   options: IStyleOptions
): Promise<IStyleOptions> => {
   const { input, output, flags, config } = options;
   const sassOptions = {
      file: input,
      includePaths: config.scss.includePaths,
      outFile: output,
      outputStyle: config.scss.outputStyle,
      sourceMap: 'DEBUG' in flags && flags.DEBUG,
      functions: {
         '@debug'(msg: any) {
            log.info('ℹ ' + msg.getValue());
            return sass.NULL;
         },
         '@error'(msg: any) {
            log.error('❌ ' + msg.getValue());
            return sass.NULL;
         },
         '@warn'(msg: any) {
            log.warn('⚠ ' + msg.getValue());
            return sass.NULL;
         },
      },
   };

   try {
      const result = await sassRender(sassOptions);
      const { css, stats, map, fileName } = result;

      if (stats) {
         log.info(
            `🛠  Built entry point: ${chalk.yellow(
               stats.entry
            )} in ${chalk.yellow(stats.duration.toString())}ms`
         );
      }

      return {
         input: stats.entry,
         output: fileName,
         css: css.toString(),
         map: map.toString(),
         flags,
         config,
      };
   } catch (err) {
      log.error(err);
   }
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default sassBuild;
