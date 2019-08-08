import * as fs from 'fs';
import postcss from 'postcss';
import atImport from 'postcss-easy-import';
import stylelint from 'stylelint';
import log from 'fancy-log';
import { IStyleOptions } from '../style';

/* -----------------------------------
 *
 * Lint
 *
 * -------------------------------- */

const processor = postcss([atImport]);

const styleLint = async (
   options: IStyleOptions
): Promise<IStyleOptions> => {
   try {
      const styleLintOptions = options.config.lint;
      options.css = fs.readFileSync(options.input, 'utf8');

      const { css } = processor.process(options.css);

      styleLintOptions.code = css;

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
      process.exit(1);
   }
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleLint;
