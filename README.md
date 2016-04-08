# require-compiled

`require-compiled` works just like regular `require`, except it allows you to require code written in newer versions of JS:

```js
  // Read babel options our of your .babelrc:
  var requireCompiled = require('require-compiled');
  var myModule = requireCompiled('./my-module');
  var myModulePath = requireCompiled.resolve('./my-module');

  // Pass your babel options explicitly:
  var requireCompiled = require('require-compiled').babelOptions({ ... });
```

Only the module directly required this way gets compiled, not its dependencies!

Behind the scenes the module file is compiled to a cache direction.
Because of this, `require-compiled` does not need to load require hooks into your node process.
`require-compiled` does load [node-source-map-support](https://github.com/evanw/node-source-map-support) to give you nice stack traces in your errors.

## Thanks
The code of the amazing [ava](https://github.com/sindresorhus/ava) testrunner was a great inspiration and guide for this module.
