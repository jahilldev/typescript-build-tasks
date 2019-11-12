import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import hash from 'postcss-hash';

/* -----------------------------------
 *
 * Interfaces
 *
 * -------------------------------- */

interface IPathConfig {
   dist: string;
   src: string;
}

interface IStyleConfig {
   entryPoints: string[];
   styleDir: string | RegExp;
   themesDir: string | RegExp;
}

interface IDependencyConfig {
   prefix: string;
   extensions: string[];
}

interface ITargetConfig {
   targetDir: string;
   asyncGlob: string;
   criticalGlob: string;
   criticalFileExtension: string;
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

interface IPostCSSConfig {
   plugins: IPostCSSPluginConfig[];
}

interface IConfig {
   path: IPathConfig;
   dependency: IDependencyConfig;
   target?: ITargetConfig;
   lint: ILintConfig;
   style: IStyleConfig;
   scss: ISASSConfig;
   postcss: IPostCSSConfig;
}

/* -----------------------------------
 *
 * Config
 *
 * -------------------------------- */

const path: IPathConfig = {
   dist: './dist/',
   src: './src/',
};

const dependency: IDependencyConfig = {
   prefix: '_',
   extensions: ['.scss'],
};

const target: ITargetConfig = {
   targetDir: 'client',
   asyncGlob: './async/[^_]*.scss',
   criticalGlob: './critical/[^_]*.scss',
   criticalFileExtension: 'cshtml',
};

const lint: ILintConfig = {
   configFile: '.stylelintrc.yml',
   cache: true,
   formatter: 'verbose',
   syntax: 'scss',
};

const style: IStyleConfig = {
   entryPoints: [
      './src/style/index.scss',
      './src/style/themes/**/[^_]*.scss',
   ],
   styleDir: new RegExp(/^style[s]?$/, 'i'),
   themesDir: new RegExp(/^theme[s]?$/, 'i'),
};

const scss: ISASSConfig = {
   includePaths: ['./src/style/'],
   outputStyle: 'expanded',
};

const postcss: IPostCSSConfig = {
   plugins: [
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
            manifest: './dist/assets.json',
         },
      },
   ],
};

const config: IConfig = {
   path,
   dependency,
   target,
   lint,
   style,
   scss,
   postcss,
};

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { config, IConfig };
