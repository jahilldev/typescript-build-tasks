import run from './run';
import criticalStyle from './style/critical';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startCriticalStyle() {
   await run(criticalStyle);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startCriticalStyle;
