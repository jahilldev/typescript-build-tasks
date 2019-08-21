import run from './run';
import defaultStyle from './style/style';

/* -----------------------------------
 *
 * Start
 *
 * -------------------------------- */

async function startStyle() {
   await run(defaultStyle);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default startStyle;
