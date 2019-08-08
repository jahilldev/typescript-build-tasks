import { Plugin } from 'postcss';

declare namespace 'postcss-easy-import' {
   interface Options {
      prefix: boolean;
      extensions: string[];
   }

   type PostcssEasyImport = Plugin<Options>;
}

declare const PostcssEasyImport: PostcssEasyImport.PostcssEasyImport;

export = PostcssEasyImport;
