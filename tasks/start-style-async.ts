import run from './run';
import { config } from './config';
import { asyncStyleBuilder } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startAsyncStyle() {
   await run(asyncStyleBuilder, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startAsyncStyle;
