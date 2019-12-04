import postcss from 'postcss';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

async function postcssBuild(
   options: IStyleOptions
): Promise<IStyleOptions> {
   const { input, output, css, map, contextLog, config } = options;
   const postcssOptions = {
      from: input,
      to: output,
      map: process.argv.includes('--debug') && {
         inline: false,
         prev: map && map.toString(),
         sourcesContent: true,
      },
   };

   const plugins = config.postcss.reduce(
      (pluginList, currentPlugin) => {
         const {
            transformer,
            options: pluginOptions,
         } = currentPlugin;

         if (
            !currentPlugin.hasOwnProperty('conditionals') ||
            Array.from(currentPlugin.conditionals).every(condition =>
               process.argv.includes(`--${condition.toLowerCase()}`)
            )
         ) {
            pluginList.push(transformer(pluginOptions));
         }

         return pluginList;
      },
      []
   );

   const processor = postcss(plugins);

   try {
      const {
         css: resultCSS,
         map: resultMap,
         messages,
      } = await processor.process(css.toString(), postcssOptions);

      if (messages) {
         messages.map(message => {
            contextLog(message);
         });
      }

      Object.assign(options, {
         css: resultCSS,
         map: resultMap && resultMap.toString(),
      });

      return options;
   } catch (err) {
      contextLog(err.message, err.stack);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default postcssBuild;
