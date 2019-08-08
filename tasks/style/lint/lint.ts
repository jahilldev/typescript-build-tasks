import * as fs from 'fs';
import postcss, { ResultMessage } from 'postcss';
import atImport from 'postcss-easy-import';
import stylelint from 'stylelint';
import log from 'fancy-log';
import chalk from 'chalk';
import { IStyleOptions } from '../style';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface IImportDependencies {
   [key: string]: {
      imports: string[];
      importedBy: string[];
   };
}

/* -----------------------------------
 *
 * Handlers
 *
 * -------------------------------- */

const dependencyHandler = (
   message: ResultMessage,
   graph: IImportDependencies
) => {
   if (!(message.file in graph)) {
      graph[message.file] = {
         imports: [],
         importedBy: [],
      };
   }

   if (!graph[message.file].importedBy.includes(message.parent)) {
      graph[message.file].importedBy.push(message.parent);
   }

   if (message.parent in graph) {
      graph[message.parent].imports.push(message.file);
   } else {
      graph[message.parent] = {
         imports: [],
         importedBy: [],
      };
   }

   if (!graph[message.parent].imports.includes(message.file)) {
      graph[message.parent].imports.push(message.file);
   }
};

const warningHandler = (message: ResultMessage) => {
   log.warn(`
${chalk.bgYellow.black(
   '⚠  ' + message.type.toUpperCase()
)} from ${chalk.green(message.plugin)}:
   ${chalk.bold.blue('location:')}
      ${chalk.bold.blueBright('file:')} ${chalk.yellow(
      message.node.source.input.file
   )}
      ${chalk.bold.blueBright('line:')} ${message.line}
      ${chalk.bold.blueBright('column:')} ${message.column}
   ${chalk.bold.blue('message:')} ${message.text}
   `);
};

const errorHandler = (message: ResultMessage) => {
   log.error(`
${chalk.bgRed.black(
   '❌  ' + message.type.toUpperCase()
)} from ${chalk.green(message.plugin)}:
   ${chalk.bold.blue('location:')}
      ${chalk.bold.blueBright('file:')} ${chalk.yellow(
      message.node.source.input.file
   )}
      ${chalk.bold.blueBright('line:')} ${message.line}
      ${chalk.bold.blueBright('column:')} ${message.column}
   ${chalk.bold.blue('message:')} ${message.text}
   `);
};

const postCSSMessageHandler = (messages: ResultMessage[]) => {
   const importDependencies: IImportDependencies = {};

   for (const message of messages) {
      switch (message.type) {
         case 'dependency':
            dependencyHandler(message, importDependencies);
            break;
         case 'warning':
            warningHandler(message);
            break;
         case 'error':
            errorHandler(message);
            process.exit(1);
            break;
         default:
            throw Error(
               `Unknown PostCSS message type: ${message.type}`
            );
      }
   }

   return importDependencies;
};

/* -----------------------------------
 *
 * Lint
 *
 * -------------------------------- */

const styleLint = async (
   options: IStyleOptions
): Promise<IStyleOptions> => {
   try {
      const { input, output, config } = options;
      const postcssOptions = {
         from: input,
         to: output,
      };
      const styleLintOptions = options.config.lint;
      options.css = fs.readFileSync(options.input, 'utf8');

      const { messages } = await postcss()
         .use(
            atImport({
               prefix: '_',
               extensions: ['.scss'],
            })
         )
         .process(options.css, postcssOptions);

      console.time('dependency graph'); // tslint:disable-line:no-console
      const dependencyGraph =
         messages && postCSSMessageHandler(messages);
      console.timeEnd('dependency graph'); // tslint:disable-line:no-console

      styleLintOptions.files = Object.keys(dependencyGraph);

      const result = await stylelint.lint(styleLintOptions);

      if (result.output) {
         log.info(result.output);
      }

      if (!result.errored) {
         return options;
      }

      throw Error(
         'Stylelint found errors, please resolve errors listed above.'
      );
   } catch (err) {
      log.error(err);
      process.exit(1);
   }
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleLint;
