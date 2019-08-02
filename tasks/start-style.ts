import run from './run';
import clean from './clean';
import buildStyles from './style/build/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startStyle() {
   await run(clean);
   await run(buildStyles);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startStyle;
