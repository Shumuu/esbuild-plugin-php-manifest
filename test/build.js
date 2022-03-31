const esbulild = require('esbuild');
const esbuildPluginPHPManifest = require('../lib/index.js');

esbulild.build({
  entryPoints: ['./test/src.js', './test/src copy.js'],
  bundle: true,
  outdir: './',
  plugins: [
    esbuildPluginPHPManifest({
      pathPHPManifest: './php-manifest.php',
    }),
  ],
});
