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

export interface IFlags {
   [key: string]: boolean;
}

export interface IBaseStyleOptions {
   target: 'default' | 'async' | 'critical';
   flags: IFlags;
   config: IConfig;
   contextLog: ContextLogger;
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
