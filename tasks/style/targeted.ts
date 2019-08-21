import log from 'fancy-log';
import defaultStyle from './style';
import criticalStyle from './critical';
import asyncStyle from './async';

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

const targetedStyle = () =>
   new Promise(async (resolve, reject) => {
      try {
         Promise.all([defaultStyle(), criticalStyle(), asyncStyle()]);
      } catch (err) {
         reject(log.error(err));
      } finally {
         resolve();
      }
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default targetedStyle;
