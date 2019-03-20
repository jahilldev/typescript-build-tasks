import mkdirp from 'mkdirp';

/* -----------------------------------
 *
 * Make Directory
 *
 * -------------------------------- */

const makeDir = (name: string) =>
   new Promise((resolve, reject) => {
      mkdirp(name, err => (err ? reject(err) : resolve()));
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { makeDir };
