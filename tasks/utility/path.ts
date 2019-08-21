import * as path from 'path';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface IFindResult {
   name: string;
   index: number;
}

/* -----------------------------------
 *
 * Path Utilities
 *
 * -------------------------------- */

function constructCompareTuples(pathArray: Array<string | RegExp>) {
   return pathArray.reduce(
      (
         compareTuples: Array<[RegExp, string]>,
         pathEntry: string | RegExp
      ) => {
         const tupleRegExp =
            pathEntry instanceof RegExp ? pathEntry : void 0;
         const tupleString =
            pathEntry instanceof RegExp ? void 0 : pathEntry;

         compareTuples.push([tupleRegExp, tupleString]);

         return compareTuples;
      },
      []
   );
}

function getDirectoryArray(sourcePath: string): string[] {
   const parsedPath = path.parse(sourcePath);

   return parsedPath.dir.split(path.sep);
}

function matchDirectoryArray(
   compareTuples: Array<[RegExp, string]>,
   referencePathArray: string[]
): boolean {
   if (compareTuples.length !== referencePathArray.length) {
      return false;
   }

   return referencePathArray.every(
      (directory: string, index: number) => {
         const compareTerm =
            compareTuples[index][0] || compareTuples[index][1];

         return directory.match(compareTerm);
      }
   );
}

function pathFindDirectory(
   pathArray: string[],
   searchTerm: string | RegExp
): IFindResult {
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
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export {
   constructCompareTuples,
   getDirectoryArray,
   matchDirectoryArray,
   pathFindDirectory,
};
