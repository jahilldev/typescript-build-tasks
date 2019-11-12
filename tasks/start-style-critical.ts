import run from './run';
import { config } from './config';
import { criticalStyle } from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startCriticalStyle() {
   await run(criticalStyle, config);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startCriticalStyle;
