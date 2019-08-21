import run from './run';
import asyncStyle from './style/async';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startAsyncStyle() {
   await run(asyncStyle);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startAsyncStyle;
