/* -----------------------------------
 *
 * Config
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

interface IAutoPrefixerConfig {
   cascade: boolean;
}

interface IPostCSSConfig {
   autoprefixer: IAutoPrefixerConfig;
}

interface IConfig {
   path: IPathConfig;
   dependency: IDependencyConfig;
   lint: ILintConfig;
   style: IStyleConfig;
   scss: ISASSConfig;
   postcss: IPostCSSConfig;
}

const path: IPathConfig = {
   dist: './dist/',
   src: './src/',
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

const style: IStyleConfig = {
   entryPoints: [
      './src/style/index.scss',
      './src/style/themes/**/[^_]*.scss',
   ],
   styleDir: new RegExp(/^style[s]?$/, 'i'),
   themesDir: new RegExp(/^theme[s]?$/, 'i'),
};

const scss: ISASSConfig = {
   includePaths: ['./src/style/**/*.scss'],
   outputStyle: 'expanded',
};

const autoprefixer: IAutoPrefixerConfig = {
   cascade: false,
};

const postcss: IPostCSSConfig = {
   autoprefixer,
};

const config: IConfig = {
   path,
   dependency,
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

export { config };
