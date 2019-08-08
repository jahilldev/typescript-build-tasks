import * as path from 'path';
import { config } from '../config';

/* -----------------------------------
 *
 * Regular Expressions
 *
 * -------------------------------- */

const stylesRegExp =
   config.style.styleDir || new RegExp(/^style[s]?$/, 'i');
const themesRegExp =
   config.style.themesDir || new RegExp(/^theme[s]?$/, 'i');

/* -----------------------------------
 *
 * Output FileName
 *
 * -------------------------------- */

export const getDirectoryArray = (sourcePath: string): string[] => {
   const parsedPath = path.parse(sourcePath);
   return parsedPath.dir.split(path.sep);
};

export const matchDirectoryArray = (
   compareTuple: [string[], RegExp[]],
   referencePathArray: string[]
): boolean => {
   return referencePathArray.every(
      (directory: string, index: number) => {
         const compareTerm =
            compareTuple[0][index] || compareTuple[1][index];
         return directory.match(compareTerm);
      }
   );
};

export const findSubDirectory = (
   pathArray: string[],
   searchTerm: string | RegExp
) => {
   if (pathArray.some((dir: string) => dir.match(searchTerm))) {
      const searchResult = pathArray.find((dir: string) =>
         dir.match(searchTerm)
      );

      return {
         name: searchResult,
         index: pathArray.indexOf(searchResult),
      };
   }

   throw Error(
      `Subdirectory matching search term: ${searchTerm} not found in ${pathArray.join(
         path.sep
      )}`
   );
};

export const styleOutFile = (entryPoint: string): string => {
   const sourcePath = path.resolve(process.cwd(), config.path.src);
   const entryPath = path.resolve(process.cwd(), entryPoint);
   const relativeEntryPath = path.relative(sourcePath, entryPath);
   const stylePathArray = [
      ...getDirectoryArray(sourcePath),
      path.parse(sourcePath).name,
   ];
   const styleRegExpArray: RegExp[] = Array.from({
      length: stylePathArray.length,
   });

   if (stylesRegExp instanceof RegExp) {
      stylePathArray.push('');
      styleRegExpArray.push(stylesRegExp);
   } else {
      stylePathArray.push(stylesRegExp);
      styleRegExpArray.push(void 0);
   }

   if (
      matchDirectoryArray(
         [stylePathArray, styleRegExpArray],
         getDirectoryArray(entryPath)
      )
   ) {
      return path.resolve(
         process.cwd(),
         config.path.dist,
         'style.css'
      );
   }

   const themesDir = findSubDirectory(
      getDirectoryArray(relativeEntryPath),
      themesRegExp
   );

   if (themesDir) {
      const themeName = getDirectoryArray(relativeEntryPath)[
         themesDir.index + 1
      ];

      return path.resolve(
         process.cwd(),
         config.path.dist,
         `${themeName}-${path.parse(relativeEntryPath).name}.css`
      );
   }

   throw Error(
      `The current directory structure is not accounted for.${entryPath}`
   );
};
