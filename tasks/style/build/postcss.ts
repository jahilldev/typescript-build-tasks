import path from 'path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { IStyleOptions } from '../style.d';

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

const processor = postcss([autoprefixer, cssnano]);

async function postcssBuild(
   options: IStyleOptions
): Promise<IStyleOptions> {
   const {
      input,
      output,
      css,
      map,
      target,
      flags,
      contextLog,
   } = options;
   const { dir, name } = path.parse(output);
   const mapFileName = `${path.join(dir, name)}.${target}.css.map`;
   const postcssOptions = {
      from: input,
      to: output,
      map: 'DEBUG' in flags &&
         flags.DEBUG && {
            inline: false,
            prev: map && map.toString(),
            sourcesContent: true,
            annotation: mapFileName,
         },
   };

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
      contextLog(err);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default postcssBuild;
