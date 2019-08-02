import * as path from 'path';
import globby from 'globby';
import chalk from 'chalk';
import log from 'fancy-log';
import { writeFile } from '../../utility';
import sassBuild from './sass';
import postcssBuild from './postcss';
import { config } from '../../config';

/* -----------------------------------
 *
 * Flags
 *
 * -------------------------------- */

const DEBUG = process.argv.includes('--debug');

/* -----------------------------------
 *
 * Output FileName
 *
 * -------------------------------- */

const outFile = (entryPoint: string): string => {
   const stylesRegExp = new RegExp(/^style[s]?$/, 'i');
   const themesRegExp = new RegExp(/^theme[s]?$/, 'i');
   const sourcePath = path.resolve(process.cwd(), config.path.src);
   const entryPath = path.resolve(process.cwd(), entryPoint);
   const relativeEntryPath = path.parse(
      path.relative(sourcePath, entryPath)
   );
   const entryDirectoryArray = relativeEntryPath.dir.split(path.sep);

   if (
      entryDirectoryArray.length === 1 &&
      entryDirectoryArray[0].match(stylesRegExp)
   ) {
      return path.resolve(
         process.cwd(),
         config.path.dist,
         'style.css'
      );
   }

   if (
      entryDirectoryArray.some((dir: string) =>
         dir.match(themesRegExp)
      )
   ) {
      const themesDir = entryDirectoryArray.find((dir: string) =>
         dir.match(themesRegExp)
      );
      const themeName =
         entryDirectoryArray[
            entryDirectoryArray.indexOf(themesDir) + 1
         ];

      return path.resolve(
         process.cwd(),
         config.path.dist,
         `${themeName}-${relativeEntryPath.name}.css`
      );
   }

   throw Error(
      'The current directory structure is not accounted for.' +
         entryDirectoryArray
   );
};

// : outFile(entryPoint)

/* -----------------------------------
 *
 * Style
 *
 * -------------------------------- */

const buildStyles = () =>
   new Promise(async resolve => {
      let entryPoints;

      try {
         log(typeof config.style.entryPoints);
         entryPoints = await globby(config.style.entryPoints);
      } catch (err) {
         return log.error(err);
      }

      const builds = entryPoints.map(async entryPoint => {
         const sassOptions = {
            file: entryPoint,
            includePaths: config.scss.includePaths,
            outFile: outFile(entryPoint),
            outputStyle: config.scss.outputStyle,
            sourceMap: DEBUG,
         };

         let result;

         try {
            result = await sassBuild(sassOptions);
         } catch (err) {
            return log.error(err);
         }

         const { css, stats, map, fileName } = result;

         if (stats) {
            log.info(
               `🛠  Built entry point: ${chalk.yellow(
                  stats.entry
               )} in ${chalk.yellow(stats.duration.toString())}ms`
            );
         }

         const postcssOptions = {
            from: stats.entry,
            to: fileName,
            map: {
               inline: false,
               prev: map.toString(),
               sourcesContent: true,
            },
         };

         try {
            result = await postcssBuild(
               css.toString(),
               postcssOptions
            );
         } catch (err) {
            return log.error(err);
         }

         const {
            css: finalCSS,
            opts: options,
            map: finalMap,
            messages,
         } = result;

         if (messages) {
            messages.map(message => {
               log(message);
            });
         }

         try {
            writeFile(options.to, finalCSS);
         } catch (err) {
            log.error(err);
         }

         if (finalMap) {
            try {
               writeFile(options.to + '.map', finalMap);
            } catch (err) {
               log.error(err);
            }
         }
      });

      Promise.all(builds).then(resolve);
   });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default buildStyles;
