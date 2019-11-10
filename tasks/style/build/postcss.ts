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
   const {
      input,
      output,
      css,
      map,
      flags,
      contextLog,
      config,
   } = options;
   const postcssOptions = {
      from: input,
      to: output,
      map: 'DEBUG' in flags &&
         flags.DEBUG && {
            inline: false,
            prev: map && map.toString(),
            sourcesContent: true,
         },
   };

   const plugins = config.postcss.plugins.reduce(
      (pluginList, currentPlugin) => {
         const {
            transformer,
            options: pluginOptions,
         } = currentPlugin;

         if (
            !currentPlugin.hasOwnProperty('conditionals') ||
            Array.from(currentPlugin.conditionals).every(
               condition => condition in flags && flags[condition]
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
         opts: { to: fileName },
      } = await processor.process(css.toString(), postcssOptions);

      if (messages) {
         messages.map(message => {
            contextLog(message);
         });
      }

      Object.assign(options, {
         css: resultCSS,
         fileName,
         map: resultMap && resultMap.toString(),
      });

      return options;
   } catch (err) {
      contextLog(err);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default postcssBuild;
