# require-compiled
[![NPM version](http://img.shields.io/npm/v/require-compiled.svg?style=flat-square)](https://www.npmjs.com/package/require-compiled)
[![Build status](http://img.shields.io/travis/jwoudenberg/require-compiled/master.svg?style=flat-square)](https://travis-ci.org/jwoudenberg/require-compiled)
[![Dependencies](https://img.shields.io/david/jwoudenberg/require-compiled.svg?style=flat-square)(https://david-dm.org/jwoudenberg/require-compiled)]

`require-compiled` works just like regular `require`, except it allows you to require code written in newer versions of JS.
Just add a [.babelrc](https://babeljs.io/docs/usage/babelrc/) file to your project and you're good to go!

```js
  // Read babel options our of your .babelrc:
  var requireCompiled = require('require-compiled');
  var myModule = requireCompiled('./my-module');
  var myModulePath = requireCompiled.resolve('./my-module');

  // Instead of using a .babelrc, you can also pass in your babel options explicitly:
  var requireCompiled = require('require-compiled').babelOptions({ ... });
```

Only the module directly required this way gets compiled, not its dependencies!

Behind the scenes the module file is compiled to a cache direction.
Because of this, `require-compiled` does not need to load require hooks into your node process.
`require-compiled` does load [node-source-map-support](https://github.com/evanw/node-source-map-support) to give you nice stack traces in your errors.

## Thanks
The code of the amazing [ava](https://github.com/sindresorhus/ava) testrunner was a great inspiration and guide for this module.
