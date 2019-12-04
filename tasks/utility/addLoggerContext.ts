import chalk from 'chalk';

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

function addLoggerContext(
   logger: (...args: any[]) => void,
   label: string,
   fg: string,
   bg: string
) {
   const prefix = chalk`{${fg}.bold.${bg}  ${label.toUpperCase()} }`;

   return contextLogger;

   function contextLogger(...args: any[]) {
      const [data, ...rest] = args;
      const message = `%s ${data}`;

      rest.unshift(prefix);
      logger.apply(logger, [message, ...rest]);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { addLoggerContext };
