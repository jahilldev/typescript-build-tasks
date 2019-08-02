import postcss, { Result as PostCSSResult } from 'postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

interface IPostCSSOptions {
   from: string;
   to: string;
   map: {
      inline: boolean;
      prev: string;
      sourcesContent: boolean;
   };
}

const processor = postcss([autoprefixer, cssnano]);

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

const postcssBuild = async (
   css: string,
   postcssOptions: IPostCSSOptions
): Promise<PostCSSResult> => {
   return processor.process(css, postcssOptions);
};

/* -----------------------------------
 *
 * Build
 *
 * -------------------------------- */

export default postcssBuild;
