import * as fs from 'fs';
import path from 'path';
import { makeDir, writeFile } from '../../utility';
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
   const { target, contextLog } = options;

   try {
      let result = await dependencyGraph(options);

      if (process.argv.includes('--lint')) {
         result = await styleLint(result);
      }

      result = await sassBuild(result);
      result = await postcssBuild(result);

      if (target.variety.toLowerCase() === 'critical') {
         result = await criticalEscape(result);
      }

      const { dir, name, ext } = path.parse(
         path.relative(process.cwd(), result.output)
      );

      if (!fs.existsSync(dir)) {
         await makeDir(dir);
      }

      writeFile(result.output, result.css);

      if (result.map) {
         writeFile(`${path.join(dir, name)}${ext}.map`, result.map);
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
