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
}

interface ISASSConfig {
   includePaths: string[];
   outputStyle: 'compact' | 'compressed' | 'expanded' | 'nested';
}

interface IConfig {
   path: IPathConfig;
   style: IStyleConfig;
   scss: ISASSConfig;
}

const path: IPathConfig = {
   dist: './dist/',
   src: './src/',
};

const style: IStyleConfig = {
   entryPoints: [
      './src/style/index.scss',
      './src/style/themes/**/[^_]*.scss',
   ],
};

const scss: ISASSConfig = {
   includePaths: ['./src/style/**/*.scss'],
   outputStyle: 'expanded',
};

const config: IConfig = { path, style, scss };

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { config };
