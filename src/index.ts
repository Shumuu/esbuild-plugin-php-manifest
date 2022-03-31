import { Plugin } from 'esbuild';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Function} RewriteManifest
 * @param {string} key
 * @param {string} value
 * @returns {[string, string]}
 */

function generateTemplate(files: Array<string>) {
  return `<?php
  class EsbuildPluginPhpManifest {
    static $files = [
${files.join(',\n')}
      ];
  };`;
}

type PluginProps = {
  pathPHPManifest?: string;
  hash?: boolean | string;
  rewriteManifest?: (key: string, value: string) => [string, string];
};

/**
 * @param {Object} options
 * @param {string=} options.pathPHPManifest Optional Path for the generated PHP Manifest File
 * @param {string|boolean=} options.hash Optional Hash, if true we'll use the hash [dir]/[name]-[hash], if it's a string, we'll use that one.
 * @param {RewriteManifest=} options.rewriteManifest Optional Function that receives the key (input File) and the value (output File). It needs to return a tuple [key, value]
 */
export = (options: PluginProps): Plugin => ({
  name: 'esbuild-plugin-php-manifest',
  setup(build) {
    const outdir = build.initialOptions.outdir;
    if (outdir == undefined || typeof outdir !== 'string') {
      throw new Error('No outdir was provided');
    }
    if (options.hash) {
      build.initialOptions.entryNames = typeof options.hash === 'string' ? options.hash : '[dir]/[name]-[hash]';
    }
    if (options.hash) build.initialOptions.metafile = true;

    build.onEnd((result) => {
      // Here we will map the inputFile (key) to the outputFile (value)
      const mappingInputOutput = new Map<string, string>();

      const addMapping = (input: string, output: string) => {
        mappingInputOutput.set(input, output);
      };

      for (const output in result.metafile?.outputs) {
        const infoOutput = result.metafile?.outputs[output];

        if (infoOutput == null || !infoOutput?.entryPoint) {
          continue;
        }
        addMapping(infoOutput.entryPoint, output);
      }

      const files: Array<string> = [];

      mappingInputOutput.forEach((v, k) => {
        const [key, value] = typeof options.rewriteManifest === 'function' ? options.rewriteManifest(k, v) : [k, v];
        files.push(`        "${key}" => "${value}"`);
      });

      const templatePHP = generateTemplate(files);

      const pathManifest = options.pathPHPManifest || path.join(outdir, 'php-manifest.php');
      return fs.promises.writeFile(pathManifest, templatePHP);
    });
  },
});
