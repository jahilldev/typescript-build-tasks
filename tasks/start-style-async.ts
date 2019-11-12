import run from './run';
import { config } from './config';
import { asyncStyle } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startAsyncStyle() {
   await run(asyncStyle, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startAsyncStyle;
