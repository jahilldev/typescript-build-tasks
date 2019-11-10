declare module 'postcss-hash' {
   import { Plugin } from 'postcss';

   // tslint:disable-next-line interface-name
   interface Options {
      algorithm:
         | 'md5'
         | 'md4'
         | 'md2'
         | 'sha'
         | 'sha1'
         | 'sha224'
         | 'sha256'
         | 'sha384'
         | 'sha512';
      trim: number;
      manifest: string;
   }

   type PostcssHash = Plugin<Options>;

   function plugin(options: Options): PostcssHash;

   export = plugin;
}
