import * as fs from 'fs';
import postcss, { ResultMessage } from 'postcss';
import scss from 'postcss-scss';
import atImport from 'postcss-easy-import';
import chalk from 'chalk';
import { IDependencyConfig } from '../../config';
import {
   ContextLogger,
   DependencyGraph,
   IDependencies,
} from '../style.d';

/* -----------------------------------
 *
 * Handlers
 *
 * -------------------------------- */

function dependencyHandler(
   entryPoint: string,
   message: ResultMessage,
   graph: DependencyGraph
) {
   if (!graph.has(message.file)) {
      graph.set(message.file, {
         entryPoints: new Set([entryPoint]),
         imports: new Set([]),
         importedBy: new Set([]),
      });
   }

   graph.get(message.file).importedBy.add(message.parent);
   graph.get(message.parent).imports.add(message.file);

   if (!graph.has(message.parent)) {
      graph.set(message.parent, {
         entryPoints: new Set([entryPoint]),
         imports: new Set([]),
         importedBy: new Set([]),
      });
   }

   graph.get(message.parent).imports.add(message.file);
}

function warningHandler(
   message: ResultMessage,
   contextLog: ContextLogger
) {
   contextLog(chalk`{bgYellow.black  ⚠  ${message.type.toUpperCase()} } from {green ${
      message.plugin
   }}:
   {bold.blue location:}
      {bold.blueBright file:} {yellow ${
         message.node.source.input.file
      }}
      {bold.blueBright line:} ${message.line}
      {bold.blueBright column:} ${message.column}
   {bold.blue message:} ${message.text}
   `);
}

function errorHandler(
   message: ResultMessage,
   contextLog: ContextLogger
) {
   contextLog(chalk`{bgRed.black  ❌ ${message.type.toUpperCase()} } from {green ${
      message.plugin
   }}:
   {bold.blue location:}
      {bold.blueBright file:} {yellow ${
         message.node.source.input.file
      }}
      {bold.blueBright line:} ${message.line}
      {bold.blueBright column:} ${message.column}
   {bold.blue message:} ${message.text}
   `);
}

function postCSSMessageHandler(
   entryPoint: string,
   messages: ResultMessage[],
   contextLog: ContextLogger
) {
   const importDependencies: DependencyGraph = new Map([
      [
         entryPoint,
         {
            entryPoints: new Set([entryPoint]),
            imports: new Set([]),
            importedBy: new Set([]),
         },
      ],
   ]);

   for (const message of messages) {
      switch (message.type) {
         case 'dependency':
            dependencyHandler(
               entryPoint,
               message,
               importDependencies
            );
            break;
         case 'warning':
            warningHandler(message, contextLog);
            break;
         case 'error':
            errorHandler(message, contextLog);
            process.exitCode = 1;
            break;
         default:
            throw Error(
               `Unknown PostCSS message type: ${message.type}`
            );
      }
   }

   return importDependencies;
}

async function entryPointDependencies(
   entryPoint: string,
   dependencyConfig: IDependencyConfig,
   contextLog: ContextLogger
): Promise<Map<string, IDependencies>> {
   try {
      const postcssOptions = {
         from: entryPoint,
         syntax: scss,
      };
      const scssEntry = fs.readFileSync(entryPoint, 'utf8');

      const { messages } = await postcss()
         .use(atImport(dependencyConfig))
         .process(scssEntry, postcssOptions);

      return postCSSMessageHandler(entryPoint, messages, contextLog);
   } catch (err) {
      contextLog(err.message, err.stack);
   }
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { entryPointDependencies };
