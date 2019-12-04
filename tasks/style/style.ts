import path from 'path';
import log from 'fancy-log';
import chalk from 'chalk';
import {
   config as defaultConfig,
   IConfig as IBuildConfig,
} from '../config';
import { targets, Target, ITargetConfig } from '../targets';
import { addLoggerContext } from '../utility';
import entryPointGenerator from './targeted/entryPoints';
import buildStyles from './build/build';
import styleWatch from './watch/watch';
import {
   ContextLogger,
   IStyleOptions,
   IBuildResult,
} from './style.d';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface ITargeter {
   target: Target;
   targetConfig?: ITargetConfig;
}

interface IBuilder extends ITargeter {
   buildConfig?: IBuildConfig;
   contextLog: ContextLogger;
}

interface IConfig {
   customTarget: Target;
   customTargetConfig?: ITargetConfig;
   customBuildConfig?: IBuildConfig;
}

/* -----------------------------------
 *
 * Targeter
 *
 * -------------------------------- */

function targeter({ target, targetConfig }: ITargeter) {
   const configuredTargetConfig = Object.assign(
      targets.get(target),
      targetConfig
   );
   const [fg, bg] = configuredTargetConfig.colour;
   const targetLogger = addLoggerContext(log, target, fg, bg);

   return {
      targetConfig: configuredTargetConfig,
      contextLog: targetLogger,
   };
}

/* -----------------------------------
 *
 * Configurator
 *
 * -------------------------------- */

async function configurator(buildConfig: IBuildConfig) {
   const configuredBuildConfig = Object.assign(
      defaultConfig,
      buildConfig
   );

   return configuredBuildConfig;
}

/* -----------------------------------
 *
 * Builder
 *
 * -------------------------------- */

function builder({
   target,
   targetConfig,
   buildConfig,
   contextLog,
}: IBuilder) {
   return buildEntryPoint;
   async function buildEntryPoint(
      theme: string,
      entryPoint: string
   ): Promise<IBuildResult> {
      const buildStart = process.hrtime();
      const themeTargetLogger = addLoggerContext(
         contextLog,
         theme,
         'black',
         'bgWhite'
      );
      const { name } = path.parse(entryPoint);
      const output = path.resolve(
         buildConfig.path.dist,
         `${theme}-${name}.${target}.${targetConfig.extension}`
      );
      let buildResult: IStyleOptions;

      try {
         buildResult = await buildStyles(target, {
            config: buildConfig,
            contextLog: themeTargetLogger,
            input: entryPoint,
            output,
         });
      } catch (err) {
         themeTargetLogger(err);
      } finally {
         const [seconds, nanoseconds] = process.hrtime(buildStart);
         const milliseconds = nanoseconds * Math.pow(10, -6);
         let durationColour = 'greenBright';

         if (seconds < 1) {
            if (milliseconds > 500) {
               durationColour = 'yellowBright';
            }
         } else {
            durationColour = 'redBright';
         }

         themeTargetLogger(
            chalk`🏁 Build completed: {yellow ${path.relative(
               process.cwd(),
               output
            )}} in {${durationColour} %ds %dms}`,
            seconds,
            milliseconds.toFixed(3)
         );
      }

      return {
         contextLog: themeTargetLogger,
         dependencyGraph: buildResult.dependencyGraph,
         entryPoint: buildResult.input,
         target,
         theme,
      };
   }
}

/* -----------------------------------
 *
 * Build Generator
 *
 * -------------------------------- */

async function* buildGenerator(
   buildEntryPoint: (
      theme: string,
      entryPoint: string
   ) => Promise<IBuildResult>
): AsyncGenerator<IBuildResult, IBuildResult, [string, string]> {
   let build = yield;
   let theme;
   let entryPoint;

   while (build) {
      [theme, entryPoint] = build;

      build = yield buildEntryPoint(theme, entryPoint);
   }

   return buildEntryPoint(theme, entryPoint);
}

/* -----------------------------------
 *
 * Orchestrator
 *
 * -------------------------------- */

async function orchestrator({
   customTarget,
   customTargetConfig,
   customBuildConfig,
}: IConfig) {
   const targeted = targeter({
      target: customTarget,
      targetConfig: customTargetConfig,
   });
   const buildConfig = await configurator(customBuildConfig);
   const entryPointIterator = entryPointGenerator(
      buildConfig.path.style,
      customTarget,
      targeted.targetConfig
   );
   const buildEntryPoint = builder({
      target: customTarget,
      buildConfig,
      ...targeted,
   });
   const buildIterator = buildGenerator(buildEntryPoint);
   let result: IteratorResult<[string, string]>;
   let buildResult: IteratorResult<IBuildResult>;

   do {
      try {
         buildResult = await buildIterator.next(
            result && result.value
         );
      } catch (err) {
         targeted.contextLog(err.message, err.stack);
      }

      if (
         process.argv.includes('--watch') &&
         !buildResult.done &&
         buildResult.value
      ) {
         styleWatch(
            buildIterator,
            buildResult.value,
            buildConfig.path.style
         );
      }

      try {
         result = await entryPointIterator.next();
      } catch (err) {
         targeted.contextLog(err.message, err.stack);
      }
   } while (!result.done);
}

/* -----------------------------------
 *
 * Builders
 *
 * -------------------------------- */

const asyncStyleBuilder = (customBuildConfig?: IBuildConfig) =>
   orchestrator({ customTarget: 'async', customBuildConfig });
const criticalStyleBuilder = (customBuildConfig?: IBuildConfig) =>
   orchestrator({ customTarget: 'critical', customBuildConfig });
const defaultStyleBuilder = (customBuildConfig?: IBuildConfig) =>
   orchestrator({ customTarget: 'default', customBuildConfig });

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export {
   asyncStyleBuilder,
   criticalStyleBuilder,
   defaultStyleBuilder,
};
