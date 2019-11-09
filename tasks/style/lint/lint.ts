import stylelint, { LinterOptions } from 'stylelint';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Lint
 *
 * -------------------------------- */

async function lint(options: IStyleOptions): Promise<IStyleOptions> {
   const { dependencies, config, contextLog } = options;

   try {
      const lintOptions = {
         ...config.lint,
         files: [...dependencies.keys()],
      } as LinterOptions;

      const result = await stylelint.lint(lintOptions);

      if (result.output) {
         contextLog(result.output);
      }

      if (!result.errored) {
         return options;
      }

      throw Error(
         'Stylelint found errors, please resolve errors listed above.'
      );
   } catch (err) {
      contextLog(err);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default lint;
