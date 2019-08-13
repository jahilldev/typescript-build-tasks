import * as fs from 'fs';
import postcss, { ResultMessage } from 'postcss';
import atImport from 'postcss-easy-import';
import log from 'fancy-log';
import chalk from 'chalk';
import { IStyleOptions } from '../style';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

export interface IImportDependencies {
   [file: string]: {
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

export const postCSSMessageHandler = (messages: ResultMessage[]) => {
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

const dependencyGraph = async (
   options: IStyleOptions
): Promise<IStyleOptions> => {
   const { input, output, config } = options;
   const postcssOptions = {
      from: input,
      to: output,
   };
   const scssEntry = fs.readFileSync(input, 'utf8');

   const { messages } = await postcss()
      .use(atImport(config.dependency))
      .process(scssEntry, postcssOptions);

   options.dependencies = messages && postCSSMessageHandler(messages);

   return options;
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default dependencyGraph;
