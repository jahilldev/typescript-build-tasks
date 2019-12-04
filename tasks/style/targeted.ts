import log from 'fancy-log';
import { IConfig } from '../config';
import {
   asyncStyleBuilder,
   criticalStyleBuilder,
   defaultStyleBuilder,
} from './style';

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

async function targetedStyle(config: IConfig) {
   try {
      await Promise.all([
         defaultStyleBuilder(config),
         criticalStyleBuilder(config),
         asyncStyleBuilder(config),
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
