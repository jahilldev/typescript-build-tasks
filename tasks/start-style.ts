import run from './run';
import clean from './clean';
import { config } from './config';
import targetedStyle from './style/targeted';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startStyle() {
   await run(clean);
   await run(targetedStyle, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startStyle;
