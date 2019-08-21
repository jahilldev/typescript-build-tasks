import log from 'fancy-log';
import * as fs from 'fs';

/* -----------------------------------
 *
 * Write File
 *
 * -------------------------------- */

const writeFile = (file: any, contents: any) =>
   new Promise((resolve, reject) => {
      try {
         fs.writeFile(file, contents, 'utf8', err =>
            err ? reject(err) : resolve()
         );
      } catch (err) {
         log.error(err);
      }
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { writeFile };
