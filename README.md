# esbuild-plugin-php-manifest

This Plugin will generate a PHP File that contains a Class with a static Associative Array with the key being the Input File and the value being the Output.

This Plugin was inspired by [webpack-php-manifest](https://www.npmjs.com/package/webpack-php-manifest)

Example Output

```php
// generated PHP Manifest
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
  metafile: true, // this is needed to the plugin can generate the manifest
  outdir: './out/',
  plugins: [
    phpManifestPlugin({
      pathPHPManifest: 'manifest.php',
    }),
  ],
});
```

## Plugin Options

The following Plugin Options are available

### `options.pathPHPManifest`

`string | undefined` Optional Path for the generated PHP Manifest File

### `options.hash`

`string | boolean | undefined`

If `true` or `undefined` it will use the hash provided by `esbuild`. `false` will not use a hash and if passed a `string` it will append the `string` to the file name.

### `options.rewriteManifest`

Optional function that has the signature `rewriteManifest(key: string, value: string): [string, string]`.

So it gets passed the key (the original file name) and the value (the output) and it should return a tuple `[newKey: string, newOuput: string]`.

### `options.namePHPManifestClass`

Optional Class Name for the generated PHP File, defaults to `EsbuildPluginPhpManifest`
