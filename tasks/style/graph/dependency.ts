import * as fs from 'fs';
import postcss, { ResultMessage } from 'postcss';
import scss from 'postcss-scss';
import atImport from 'postcss-easy-import';
import chalk from 'chalk';
import {
   ContextLogger,
   DependencyGraph,
   IStyleOptions,
} from '../style.d';

/* -----------------------------------
 *
 * Handlers
 *
 * -------------------------------- */

function dependencyHandler(
   message: ResultMessage,
   graph: DependencyGraph
) {
   if (!graph.has(message.file)) {
      graph.set(message.file, {
         imports: [],
         importedBy: [],
      });
   }

   if (!graph.get(message.file).importedBy.includes(message.parent)) {
      graph.get(message.file).importedBy.push(message.parent);
   }

   if (graph.has(message.parent)) {
      graph.get(message.parent).imports.push(message.file);
   } else {
      graph.set(message.parent, {
         imports: [],
         importedBy: [],
      });
   }

   if (!graph.get(message.parent).imports.includes(message.file)) {
      graph.get(message.parent).imports.push(message.file);
   }
}

function warningHandler(
   message: ResultMessage,
   contextLog: ContextLogger
) {
   contextLog(`
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
}

function errorHandler(
   message: ResultMessage,
   contextLog: ContextLogger
) {
   contextLog(`
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
}

export function postCSSMessageHandler(
   input: string,
   messages: ResultMessage[],
   contextLog: ContextLogger
) {
   const importDependencies: DependencyGraph = new Map([
      [
         input,
         {
            imports: [],
            importedBy: [],
         },
      ],
   ]);

   for (const message of messages) {
      switch (message.type) {
         case 'dependency':
            dependencyHandler(message, importDependencies);
            break;
         case 'warning':
            warningHandler(message, contextLog);
            break;
         case 'error':
            errorHandler(message, contextLog);
            process.exit(1);
            break;
         default:
            throw Error(
               `Unknown PostCSS message type: ${message.type}`
            );
      }
   }

   return importDependencies;
}

async function dependencyGraph(
   options: IStyleOptions
): Promise<IStyleOptions> {
   const { input, output, config, contextLog } = options;

   try {
      const postcssOptions = {
         from: input,
         to: output,
         syntax: scss,
      };
      const scssEntry = fs.readFileSync(input, 'utf8');

      const { messages } = await postcss()
         .use(atImport(config.dependency))
         .process(scssEntry, postcssOptions);

      options.dependencies = postCSSMessageHandler(
         input,
         messages,
         contextLog
      );

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

export default dependencyGraph;
