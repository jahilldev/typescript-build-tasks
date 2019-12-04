import run from './run';
import { config } from './config';
import { criticalStyleBuilder } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startCriticalStyle() {
   await run(criticalStyleBuilder, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startCriticalStyle;
