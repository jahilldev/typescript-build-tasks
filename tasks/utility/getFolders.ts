import fs from 'fs';
import path from 'path';

/* -----------------------------------
 *
 * Get Folders
 *
 * -------------------------------- */

function getFolders(dirPath: string) {
   return fs
      .readdirSync(dirPath)
      .filter(file =>
         fs.statSync(path.join(dirPath, file)).isDirectory()
      );
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { getFolders };
