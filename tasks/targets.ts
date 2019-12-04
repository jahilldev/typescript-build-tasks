/* -----------------------------------
 *
 * Target Interfaces
 *
 * -------------------------------- */

type Target = 'default' | 'async' | 'critical';

interface ITargetConfig {
   themes?: string[];
   file?: {
      glob: boolean;
      name: string;
   };
   extension?: string;
   colour?: [string, string];
}

type Targets = Map<Target, ITargetConfig>;

const targets: Targets = new Map([
   [
      'default',
      {
         themes: ['base', 'theme_1', 'theme_2', 'theme_3'],
         file: {
            glob: true,
            name: '[^_]*.scss',
         },
         extension: 'css',
         colour: ['black', 'bgGreenBright'],
      },
   ],
   [
      'async',
      {
         themes: ['base', 'theme_1', 'theme_2', 'theme_3'],
         file: {
            glob: true,
            name: '[^_]*.scss',
         },
         extension: 'css',
         colour: ['black', 'bgYellowBright'],
      },
   ],
   [
      'critical',
      {
         themes: ['base', 'theme_1', 'theme_2', 'theme_3'],
         file: {
            glob: true,
            name: '[^_]*.scss',
         },
         extension: 'cshtml',
         colour: ['white', 'bgRed'],
      },
   ],
]);

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { ITargetConfig, Target, targets };
