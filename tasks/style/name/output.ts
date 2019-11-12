import path from 'path';
import {
   constructCompareTuples,
   getDirectoryArray,
   matchDirectoryArray,
   pathFindDirectory,
} from '../../utility';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Name Output
 *
 * -------------------------------- */

function nameOutput(options: IStyleOptions): string {
   const { config, contextLog, input, target } = options;

   try {
      const sourcePath = path.resolve(process.cwd(), config.path.src);
      const entryPath = path.resolve(process.cwd(), input);
      const relativeEntryPath = path.relative(sourcePath, entryPath);
      const stylePathArray = [
         ...getDirectoryArray(sourcePath),
         path.parse(sourcePath).name,
         config.style.styleDir,
      ];
      const themePathArray = [
         ...stylePathArray,
         config.style.themesDir,
         new RegExp(/\S+/, 'i'),
      ];

      if (target.variety !== 'default') {
         stylePathArray.push(config.target.targetDir, target.variety);
         themePathArray.push(config.target.targetDir, target.variety);
      }

      const stylePath = constructCompareTuples(stylePathArray);
      const themePath = constructCompareTuples(themePathArray);
      let fileName: string;

      switch (target.variety) {
         case 'critical':
            fileName = `${path.parse(relativeEntryPath).name}.${
               target.variety
            }.${config.target.criticalFileExtension}`;
            break;
         case 'async':
            fileName = `${path.parse(relativeEntryPath).name}.${
               target.variety
            }.css`;
            break;
         default:
            fileName = 'style.css';
      }

      if (
         matchDirectoryArray(stylePath, getDirectoryArray(entryPath))
      ) {
         return path.resolve(
            process.cwd(),
            config.path.dist,
            fileName
         );
      }

      if (
         matchDirectoryArray(themePath, getDirectoryArray(entryPath))
      ) {
         const themesDir = pathFindDirectory(
            getDirectoryArray(relativeEntryPath),
            config.style.themesDir
         );

         const themeName = getDirectoryArray(relativeEntryPath)[
            themesDir.index + 1
         ];

         return path.resolve(
            process.cwd(),
            config.path.dist,
            `${themeName}-${fileName}`
         );
      }

      throw Error(
         `The current project structure is not accounted for.${entryPath}`
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

export { nameOutput };
