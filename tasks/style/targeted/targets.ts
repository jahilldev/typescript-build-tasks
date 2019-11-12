import path from 'path';
import globby from 'globby';
import { nameOutput } from '../name/output';
import { EntryPointOptions, IBaseStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Setup
 *
 * -------------------------------- */

async function targets(
   options: IBaseStyleOptions
): Promise<EntryPointOptions> {
   const { config, target } = options;
   const entryPointMap: EntryPointOptions = new Map();
   let entryGlobs: string[];

   switch (target.variety) {
      case 'critical':
         entryGlobs = config.style.entryPoints.map(glob => {
            const entryDir = path.parse(glob).dir;

            return path.posix.join(
               entryDir,
               config.target.targetDir,
               config.target.criticalGlob
            );
         });
         break;
      case 'async':
         entryGlobs = config.style.entryPoints.map(glob => {
            const entryDir = path.parse(glob).dir;

            return path.posix.join(
               entryDir,
               config.target.targetDir,
               config.target.asyncGlob
            );
         });
         break;
      default:
         entryGlobs = [
            ...config.style.entryPoints,
            `!./src/style/**/${config.target.targetDir}/**/*.scss`,
         ];
   }

   const entryPoints = await globby(entryGlobs);

   for (const entryPoint of entryPoints) {
      const entryPointOptions = {
         input: path.resolve(process.cwd(), entryPoint),
         get output() {
            return this.fileName || nameOutput(this);
         },
         ...options,
      };

      entryPointMap.set(entryPoint, entryPointOptions);
   }

   return entryPointMap;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default targets;
