import log from 'fancy-log';
import defaultStyle from './style';
import criticalStyle from './critical';
import asyncStyle from './async';

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

async function targetedStyle() {
   try {
      return await Promise.all([
         defaultStyle(),
         criticalStyle(),
         asyncStyle(),
      ]);
   } catch (err) {
      return log.error(err);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default targetedStyle;
