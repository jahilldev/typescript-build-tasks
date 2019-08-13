import stylelint from 'stylelint';
import log from 'fancy-log';
import { IStyleOptions } from '../style';

/* -----------------------------------
 *
 * Lint
 *
 * -------------------------------- */

const styleLint = async (
   options: IStyleOptions
): Promise<IStyleOptions> => {
   try {
      const { dependencies } = options;

      const styleLintOptions = options.config.lint;
      styleLintOptions.files = Object.keys(dependencies);

      const result = await stylelint.lint(styleLintOptions);

      if (result.output) {
         log.info(result.output);
      }

      if (!result.errored) {
         return options;
      }

      throw Error(
         'Stylelint found errors, please resolve errors listed above.'
      );
   } catch (err) {
      log.error(err);
   }
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleLint;
