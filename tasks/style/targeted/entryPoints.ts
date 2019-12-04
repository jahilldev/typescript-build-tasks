import path from 'path';
import globby from 'globby';
import { Target, ITargetConfig } from '../../targets';

/* -----------------------------------
 *
 * Entry Points
 *
 * -------------------------------- */

async function* entryPointGenerator(
   base: string,
   target: Target,
   targetConfig: ITargetConfig
): AsyncGenerator<[string, string], [string, string], void> {
   for (const [i, theme] of targetConfig.themes.entries()) {
      const themeEntry = path.posix.join(
         base,
         'themes',
         theme,
         target,
         targetConfig.file.name
      );

      const themeEntryPoints: string[] = await (targetConfig.file.glob
         ? globby(themeEntry)
         : Promise.resolve([themeEntry]));

      for (const [j, entryPoint] of themeEntryPoints.entries()) {
         const input = path.resolve(process.cwd(), entryPoint);

         if (
            i < targetConfig.themes.length &&
            j < themeEntryPoints.length
         ) {
            yield [theme, input] as [string, string];
         } else {
            return [theme, input] as [string, string];
         }
      }
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default entryPointGenerator;
