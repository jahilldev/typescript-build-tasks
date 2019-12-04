import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import chalk from 'chalk';
import log from 'fancy-log';
import { isDirDescendant } from '../../utility';
import { Target } from '../../targets';
import {
   IBuildResult,
   IDependencies,
   IEntryPointCache,
   IThemeDependencies,
} from '../style.d';

/* -----------------------------------
 *
 * Watcher
 *
 * -------------------------------- */

class WatchEventEmitter {
   private static _instance: WatchEventEmitter;
   private styleRoot: string;
   private entryPointCache: Map<string, IEntryPointCache>;
   private dependencyTree: Map<string, IThemeDependencies>;
   private activeBuilders: Map<
      Target,
      AsyncGenerator<IBuildResult, IBuildResult, [string, string]>
   >;
   private unlinkThrottle: NodeJS.Timeout;
   private activeUnlinkDirs: Set<string>;
   private watcher: FSWatcher;

   private constructor(styleRoot: string) {
      this.styleRoot = path.resolve(process.cwd(), styleRoot);
      this.entryPointCache = new Map();
      this.dependencyTree = new Map();
      this.activeBuilders = new Map();
      this.activeUnlinkDirs = new Set();
      this.watcher = chokidar
         .watch(this.styleRoot, {
            disableGlobbing: true,
            ignoreInitial: true,
         })
         .on('ready', this.handleReady)
         .on('error', this.handleError)
         .on('all', this.handleEvent.bind(this));
   }

   public static Instance(styleRoot: string) {
      return this._instance || (this._instance = new this(styleRoot));
   }

   public applyDependencies(
      buildDependencyGraph: Map<string, IDependencies>,
      entryPoint: string,
      target: Target,
      theme: string
   ) {
      if (this.entryPointCache.has(entryPoint)) {
         const cachedEntryPoint = this.entryPointCache.get(
            entryPoint
         );

         for (const key of cachedEntryPoint.dependencyGraph.keys()) {
            if (
               !buildDependencyGraph.has(key) &&
               this.dependencyTree.has(key)
            ) {
               /* This should occur when a SASS import is deleted */
               this.removeDependency(key, entryPoint);
            }
         }
      }

      for (const [filePath, dependencies] of buildDependencyGraph) {
         if (this.dependencyTree.has(filePath)) {
            const existingDependencies = this.dependencyTree.get(
               filePath
            );

            this.dependencyTree.set(filePath, {
               entryPoints: new Set([
                  ...dependencies.entryPoints,
                  ...existingDependencies.entryPoints,
               ]),
               imports: new Set([
                  ...dependencies.imports,
                  ...existingDependencies.imports,
               ]),
               importedBy: new Set([
                  ...dependencies.importedBy,
                  ...existingDependencies.importedBy,
               ]),
               targets: new Set([
                  target,
                  ...existingDependencies.targets,
               ]),
               themes: new Set([
                  theme,
                  ...existingDependencies.themes,
               ]),
            });
         } else {
            this.dependencyTree.set(filePath, {
               ...dependencies,
               targets: new Set([target]),
               themes: new Set([theme]),
            });
         }
      }

      this.entryPointCache.set(entryPoint, {
         dependencyGraph: buildDependencyGraph,
         target,
         theme,
      });
   }

   private removeDependency(
      dependencyPath: string,
      entryPoint?: string
   ) {
      if (this.dependencyTree.has(dependencyPath)) {
         const removalStart = process.hrtime();
         const invalidated = this.dependencyTree.get(dependencyPath);
         const importedByInvalidated: Set<string> = new Set();
         const importsInvalidated: Set<string> = new Set();

         if (entryPoint) {
            if (!invalidated.entryPoints.has(entryPoint)) {
               return;
            }
         }

         for (const reference of invalidated.importedBy) {
            const dependent = this.dependencyTree.get(reference);

            if (entryPoint) {
               if (dependent.entryPoints.has(entryPoint)) {
                  /* SASS Imports are not entry point dependent therefore no need to test if there are more entrypoints */
                  importedByInvalidated.add(reference);
               } else {
                  continue;
               }
            }

            dependent.imports.delete(dependencyPath);
         }

         if (invalidated.imports.size) {
            const importList = new Set(invalidated.imports);
            const importIterator = importList.values();
            let dependency = importIterator.next().value;

            while (
               dependency &&
               this.dependencyTree.has(dependency)
            ) {
               const {
                  entryPoints,
                  importedBy,
                  imports,
               } = this.dependencyTree.get(dependency);

               if (entryPoint && !entryPoints.has(entryPoint)) {
                  dependency = importIterator.next().value;

                  continue;
               }

               if (importedBy.size > 1) {
                  for (const reference of importedBy) {
                     if (importsInvalidated.has(reference)) {
                        importedBy.delete(reference);
                     }
                  }

                  if (importedBy.size) {
                     dependency = importIterator.next().value;

                     continue;
                  }
               }

               if (entryPoint && entryPoints.size > 1) {
                  dependency = importIterator.next().value;

                  continue;
               }

               for (const imported of imports) {
                  importList.add(imported);
               }

               importsInvalidated.add(dependency);
               this.dependencyTree.delete(dependency);
               dependency = importIterator.next().value;
            }
         }

         const [seconds, nanoseconds] = process.hrtime(removalStart);
         const milliseconds = nanoseconds * Math.pow(10, -6);
         let durationColour = 'greenBright';

         if (seconds < 1) {
            if (milliseconds > 5) {
               durationColour = 'yellowBright';
            } else if (milliseconds > 10) {
               durationColour = 'redBright';
            }
         } else {
            durationColour = 'redBright';
         }

         log(
            chalk`{redBright.bold.bgWhite  ✂  REMOVED } Dependency: {yellow ${path.relative(
               this.styleRoot,
               dependencyPath
            )}} in {${durationColour} %ds %dms}
               Invalidated references: {yellow ${[
                  ...importedByInvalidated,
               ]
                  .map(referencePath =>
                     path.relative(this.styleRoot, referencePath)
                  )
                  .join(',\n\r')}}
               Invalidated imports: {yellow ${[...importsInvalidated]
                  .map(importPath =>
                     path.relative(this.styleRoot, importPath)
                  )
                  .join(',\n\r')}}`,
            seconds,
            milliseconds.toFixed(3)
         );
      } else {
         throw Error(
            `Cannot remove ${dependencyPath} from dependencyTree: Not found`
         );
      }
   }

   public applyBuilder(
      buildIterator: AsyncGenerator<
         IBuildResult,
         IBuildResult,
         [string, string]
      >,
      target: Target
   ) {
      if (!this.activeBuilders.has(target)) {
         this.activeBuilders.set(target, buildIterator);
      }
   }

   private handleReady() {
      log(chalk`{white.bold.bgBlue  🔍 WATCHER READY }`);
   }

   private handleError(error: Error) {
      log.error(chalk`{red 🔍 Watcher Error: ${error.toString()}}`);
   }

   private async handleEvent(event: string, eventPath: string) {
      log.info(
         chalk`{white.bold.bgBlue  ${event.toUpperCase()} } Event detected at {yellow ${path.relative(
            this.styleRoot,
            eventPath
         )}}`
      );

      const fullPath = path.resolve(process.cwd(), eventPath);

      switch (event) {
         case 'add':
            this.handleAdd(fullPath);
            break;
         case 'addDir':
            this.handleAddDir(fullPath);
            break;
         case 'change':
            this.handleChange(fullPath);
            break;
         case 'unlink':
            this.handleUnlink(fullPath);
            break;
         case 'unlinkDir':
            this.handleUnlinkDir(fullPath);
            break;
         default:
            throw Error(`Unhandled Event Type: ${event}`);
      }
   }

   private handleAdd(eventPath: string) {
      /* TODO: check if anything needs to be done on `add` */
      log(eventPath, this.watcher.getWatched());
   }

   private handleAddDir(eventPath: string) {
      /* TODO: check if anything needs to be done on `addDir` */
      log(eventPath, this.watcher.getWatched());
   }

   private async handleChange(eventPath: string) {
      if (this.dependencyTree.has(eventPath)) {
         const dependencyData = this.dependencyTree.get(eventPath);
         const { entryPoints } = dependencyData;

         if (entryPoints.size) {
            this.triggerBuilds(entryPoints);
         }
      } else {
         log(
            chalk`{white.bold.bgBlue  IGNORED } {yellow ${path.relative(
               this.styleRoot,
               eventPath
            )}} is not associated with an active build`
         );
      }
   }

   private handleUnlink(eventPath: string) {
      if (this.dependencyTree.has(eventPath)) {
         const dependencyData = this.dependencyTree.get(eventPath);
         const { entryPoints } = dependencyData;

         if (entryPoints.has(eventPath)) {
            return;
         }

         if (this.activeUnlinkDirs.size) {
            for (const unlinkDir of this.activeUnlinkDirs) {
               if (isDirDescendant(unlinkDir, eventPath)) {
                  return;
               }

               for (const entryPoint of entryPoints) {
                  if (isDirDescendant(unlinkDir, entryPoint)) {
                     return;
                  }
               }
            }
         }

         if (entryPoints.size) {
            this.triggerBuilds(entryPoints);
         }
      } else {
         log(
            chalk`{white.bold.bgBlue  IGNORED } {yellow ${path.relative(
               this.styleRoot,
               eventPath
            )}} was not referenced by an active build`
         );
      }
   }

   private handleUnlinkDir(eventPath: string) {
      if (!this.unlinkThrottle) {
         this.unlinkThrottle = setTimeout(() => {
            for (const unlinkDir of this.activeUnlinkDirs) {
               this.throttledDirUnlink(unlinkDir);
            }
            this.activeUnlinkDirs.clear();
            delete this.unlinkThrottle;
         }, 1000);
      } else {
         clearTimeout(this.unlinkThrottle);
      }

      if (!this.activeUnlinkDirs.size) {
         return this.activeUnlinkDirs.add(eventPath);
      }

      for (const unlinkDir of this.activeUnlinkDirs) {
         if (isDirDescendant(unlinkDir, eventPath)) {
            return;
         }

         if (isDirDescendant(eventPath, unlinkDir)) {
            this.activeUnlinkDirs.delete(unlinkDir);
         }
      }

      this.activeUnlinkDirs.add(eventPath);
   }

   private throttledDirUnlink(eventPath: string) {
      const affectedEntryPoints: Set<string> = new Set();

      for (const [filePath, data] of this.dependencyTree) {
         if (isDirDescendant(eventPath, filePath)) {
            for (const entryPoint of data.entryPoints) {
               if (!isDirDescendant(eventPath, entryPoint)) {
                  affectedEntryPoints.add(entryPoint);
               } else {
                  this.removeDependency(entryPoint);
               }
            }
         }
      }

      if (affectedEntryPoints.size) {
         this.triggerBuilds(affectedEntryPoints);
      }
   }

   private async triggerBuilds(entryPoints: Set<string>) {
      if (entryPoints.size) {
         for (const entryPoint of entryPoints) {
            const { targets, themes } = this.dependencyTree.get(
               entryPoint
            );

            if (targets.size > 1) {
               throw Error(
                  `Entry point ${entryPoint} cannot belong to multiple TARGETS.`
               );
            }

            if (themes.size > 1) {
               throw Error(
                  `Entry point ${entryPoint} cannot belong multiple THEMES.`
               );
            }

            const theme = [...themes][0];
            const target = [...targets][0];

            const builder = this.activeBuilders.get(target);

            log(
               chalk`{bgGreen.black.bold  TRIGGER } Building entryPoint: {yellow ${path.relative(
                  this.styleRoot,
                  entryPoint
               )}}`
            );

            const buildResult = await builder.next([
               theme,
               entryPoint,
            ]);
            const {
               dependencyGraph: resultDependencyGraph,
               entryPoint: resultEntryPoint,
               target: resultTarget,
               theme: resultTheme,
            } = buildResult.value;

            this.applyDependencies(
               resultDependencyGraph,
               resultEntryPoint,
               resultTarget,
               resultTheme
            );
         }
      }
   }
}

/* -----------------------------------
 *
 * Watch
 *
 * -------------------------------- */

function styleWatch(
   buildIterator: AsyncGenerator<
      IBuildResult,
      IBuildResult,
      [string, string]
   >,
   {
      contextLog,
      dependencyGraph,
      entryPoint,
      target,
      theme,
   }: IBuildResult,
   styleRoot: string
) {
   const watchEventEmitter = WatchEventEmitter.Instance(styleRoot);

   contextLog(
      chalk`🔍 Entry Point added to {white.bold.bgBlue  WATCHER }: {yellow ${path.relative(
         process.cwd(),
         entryPoint
      )}}`
   );

   watchEventEmitter.applyDependencies(
      dependencyGraph,
      entryPoint,
      target,
      theme
   );
   watchEventEmitter.applyBuilder(buildIterator, target);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export default styleWatch;
