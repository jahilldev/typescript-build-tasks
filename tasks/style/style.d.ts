import { IConfig } from '../config';
import { Target } from '../targets';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

export type ContextLogger = (...messages: any[]) => void;

export type BuildStep = (
   options: IStyleOptions
) => Promise<IStyleOptions>;

export interface IStyleOptions {
   config: IConfig;
   contextLog: ContextLogger;
   css?: string;
   dependencyGraph?: DependencyGraph;
   input: string;
   map?: string;
   output: string;
}

export type EntryPointOptions = Map<string, IStyleOptions>;

export type DependencyGraph = Map<string, IDependencies>;

export interface IDependencies {
   entryPoints: Set<string>;
   imports: Set<string>;
   importedBy: Set<string>;
}

export interface IThemeDependencies extends IDependencies {
   targets: Set<Target>;
   themes: Set<string>;
}

export interface IEntryPointCache {
   dependencyGraph: DependencyGraph;
   target: Target;
   theme: string;
}

export interface IBuildResult {
   contextLog: ContextLogger;
   dependencyGraph: DependencyGraph;
   entryPoint: string;
   target: Target;
   theme: string;
}

export type Builds = Map<string, IBuildResult>;
