import path from 'path';
import { writeFile } from '../../utility';
import dependencyGraph from '../graph/dependency';
import styleLint from '../lint/lint';
import sassBuild from '../build/sass';
import postcssBuild from '../build/postcss';
import criticalEscape from '../transform/criticalEscape';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

async function buildStyles(options: IStyleOptions) {
   const { target, flags, contextLog } = options;

   try {
      let result = await dependencyGraph(options);

      if ('LINT' in flags && flags.LINT) {
         result = await styleLint(result);
      }

      result = await sassBuild(result);
      result = await postcssBuild(result);

      if (target.toLowerCase() === 'critical') {
         result = await criticalEscape(result);
      }

      writeFile(result.output, result.css);

      if (result.map) {
         const { dir, name } = path.parse(
            path.relative(process.cwd(), result.output)
         );

         writeFile(
            `${path.join(dir, name)}.${target}.css.map`,
            result.map
         );
      }

      return result;
   } catch (err) {
      contextLog(err);
   }
}

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

export default buildStyles;
