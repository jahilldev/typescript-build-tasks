import { IConfig } from '../config';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

export type ContextLogger = (...messages: any[]) => void;

export type BuildStep = (
   options: IStyleOptions
) => Promise<IStyleOptions>;

export interface ITarget {
   variety: 'default' | 'async' | 'critical';
   colour: string;
   background: string;
}

export interface IBaseStyleOptions {
   config: IConfig;
   target: ITarget;
   readonly contextLog: ContextLogger;
}

export interface IStyleOptions extends IBaseStyleOptions {
   input: string;
   readonly output: string;
   fileName?: string;
   css?: string;
   map?: string;
   dependencies?: DependencyGraph;
}

export type EntryPointOptions = Map<string, IStyleOptions>;

export type DependencyGraph = Map<string, IDependencies>;

export interface IDependencies {
   imports: string[];
   importedBy: string[];
}

export interface IBuildResult extends IStyleOptions {
   build: BuildStep;
}

export type Builds = Map<string, IBuildResult>;
