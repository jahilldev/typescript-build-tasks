import run from './run';
import clean from './clean';
import buildStyles from './style/style';

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
