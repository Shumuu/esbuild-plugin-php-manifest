import { Plugin } from 'esbuild';
import fs from 'fs';

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
  pathPHPManifest: string;
  rewriteManifest?: (key: string, value: string) => [string, string];
};

/**
 * @param {Object} options
 * @param {string} options.pathPHPManifest The Path for the generated PHP Manifest File
 * @param {RewriteManifest=} options.rewriteManifest Optional Function that receives the key (input File) and the value (output File). It needs to return a tuple [key, value]
 */
export = (options: PluginProps): Plugin => ({
  name: 'esbuild-plugin-php-manifest',
  setup(build) {
    if (typeof options.pathPHPManifest !== 'string') {
      throw new Error('pathPHPManifest was either not provided or is not a string!');
    }
    build.initialOptions.metafile = true;

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

      return fs.promises.writeFile('./php-manifest.php', templatePHP);
    });
  },
});
