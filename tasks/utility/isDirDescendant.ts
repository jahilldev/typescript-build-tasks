import path from 'path';

/* -----------------------------------
 *
 * Is Directory Descendant
 *
 * -------------------------------- */

function isDirDescendant(dir: string, testSubject: string) {
   const relative = path.relative(dir, testSubject);

   return (
      !!relative &&
      !!relative.length &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative)
   );
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { isDirDescendant };
