import del from 'del';
import { makeDir } from './utility';

/* -----------------------------------
 *
 * Clean
 *
 * -------------------------------- */

async function clean() {
   await del(['.tmp', 'dist/*', '!dist/.git'], { dot: true });

   await makeDir('dist/public');
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default clean;
