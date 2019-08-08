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

interface IConfig {
   path: IPathConfig;
   lint: ILintConfig;
   style: IStyleConfig;
   scss: ISASSConfig;
}

const path: IPathConfig = {
   dist: './dist/',
   src: './src/',
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

const config: IConfig = { path, lint, style, scss };

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { config };
