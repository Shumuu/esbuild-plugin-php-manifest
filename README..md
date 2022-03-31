# esbuild-plugin-php-manifest

This Plugin will generate a PHP File that contains a Class with a static Associative Array with the key being the Input File and the value being the Output.

This Plugin was inspired by [webpack-php-manifest](https://www.npmjs.com/package/webpack-php-manifest)

Example

```php
<?php
  class EsbuildPluginPhpManifest {
    static $files = [
        "test.js" => "out/test-2XYBNIBO.js"
      ];
  };
```

That File can then be used to include the generated assets. I'd advise to use a hash for cache busting purposes.

Sample Usage inside a PHP File

```php
<?php require_once __DIR__ . "/manifest.php"; ?>
<script src="<?= EsbuildPluginPhpManifest::$files["test.js"] ?>"></script>
```

## Install

```bash
npm install -D esbuild esbuild-plugin-php-manifest
```

## Usage

```js
const esbuild = require('esbuild');
const phpManifestPlugin = require('esbuild-plugin-php-manifest');

esbuild.build({
  entryPoints: ['test.js'],
  bundle: true,
  outdir: './out/',
  plugins: [
    phpManifestPlugin({
      pathPHPManifest: 'manifest.php',
    }),
  ],
});
```
