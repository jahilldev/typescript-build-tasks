import * as fs from 'fs';

/* -----------------------------------
 *
 * Write File
 *
 * -------------------------------- */

const writeFile = (file: any, contents: any) =>
   new Promise((resolve, reject) => {
      fs.writeFile(file, contents, 'utf8', err =>
         err ? reject(err) : resolve()
      );
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { writeFile };
