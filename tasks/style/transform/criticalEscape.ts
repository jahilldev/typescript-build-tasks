import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Critical Escape
 *
 * -------------------------------- */

async function criticalEscape(
   options: IStyleOptions
): Promise<IStyleOptions> {
   const css = options.css.replace(new RegExp('@', 'g'), '@@');

   Object.assign(options, { css });

   return options;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default criticalEscape;
