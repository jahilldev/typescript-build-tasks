import run from './run';
import { config } from './config';
import { defaultStyle } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startStyle() {
   await run(defaultStyle, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startStyle;
