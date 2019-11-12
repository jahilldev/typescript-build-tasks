import log from 'fancy-log';
import { IConfig } from '../config';
import { asyncStyle, criticalStyle, defaultStyle } from './style';

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

async function targetedStyle(config: IConfig) {
   try {
      await Promise.all([
         defaultStyle(config),
         criticalStyle(config),
         asyncStyle(config),
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
