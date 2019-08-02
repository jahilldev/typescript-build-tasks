import sass, { Result as SASSResult } from 'node-sass';
import log from 'fancy-log';

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
 * Build
 *
 * -------------------------------- */

const sassBuild = (options: ISASSOptions): Promise<IResult> => {
   options.functions = {
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
   };

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
 * Export
 *
 * -------------------------------- */

export default sassBuild;
