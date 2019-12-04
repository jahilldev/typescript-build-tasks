import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import hash from 'postcss-hash';

/* -----------------------------------
 *
 * Config Interfaces
 *
 * -------------------------------- */

interface IPathConfig {
   dist: string;
   script: string;
   src: string;
   style: string;
}

interface IDependencyConfig {
   prefix: string;
   extensions: string[];
}

interface ILintConfig {
   configFile: string;
   cache: boolean;
   formatter: string;
   syntax: string;
}

interface ISASSConfig {
   includePaths: string[];
   outputStyle: 'compact' | 'compressed' | 'expanded' | 'nested';
}

interface IPostCSSPluginConfig {
   transformer: any;
   conditionals?: Set<'DEBUG' | 'LINT' | 'RELEASE' | 'WATCH'>;
   options: {
      [option: string]: any;
   };
}

interface IConfig {
   path?: IPathConfig;
   dependency?: IDependencyConfig;
   lint?: ILintConfig;
   scss?: ISASSConfig;
   postcss?: IPostCSSPluginConfig[];
}

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const path: IPathConfig = {
   dist: './dist/',
   script: './src/script/',
   src: './src/',
   style: './src/style/',
};

const dependency: IDependencyConfig = {
   prefix: '_',
   extensions: ['.scss'],
};

const lint: ILintConfig = {
   configFile: '.stylelintrc.yml',
   cache: true,
   formatter: 'verbose',
   syntax: 'scss',
};

const scss: ISASSConfig = {
   includePaths: [path.style],
   outputStyle: 'expanded',
};

const postcss: IPostCSSPluginConfig[] = [
   {
      transformer: autoprefixer,
      options: {
         cascade: false,
      },
   },
   {
      transformer: cssnano,
      options: {
         preset: ['default'],
      },
   },
   {
      transformer: hash,
      conditionals: new Set(['RELEASE']),
      options: {
         algorithm: 'md5',
         trim: 10,
         manifest: `${path.dist}assets.json`,
      },
   },
];

const config: IConfig = {
   path,
   dependency,
   lint,
   scss,
   postcss,
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { IConfig, IDependencyConfig, config };
