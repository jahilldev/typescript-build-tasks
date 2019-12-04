import run from './run';
import { defaultStyleBuilder } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startStyle() {
   await run(defaultStyleBuilder);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startStyle;
