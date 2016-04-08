var test = require('tape')

test('control test: requiring without necessary preset', function (t) {
  clearCache()
  t.plan(1)
  t.throws(function () {
    var requireCompiled = require('../').babelOptions({
      presets: []
    })
    requireCompiled('./fixtures/es2015')
  })
})

test('requiring using user .babelrc', function (t) {
  clearCache()
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../')
    var compiledModule = requireCompiled('./fixtures/es2015')
    t.equal(compiledModule.foo, 'bar')
  })
})

test('resolving using user .babelrc', function (t) {
  clearCache()
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../')
    var compiledModulePath = requireCompiled.resolve('./fixtures/es2015')
    var compiledModule = require(compiledModulePath)
    t.equal(compiledModule.foo, 'bar')
  })
})

test('requiring using passed babel options', function (t) {
  clearCache()
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../').babelOptions({
      presets: [ require('babel-preset-es2015') ]
    })
    var compiledModule = requireCompiled('./fixtures/es2015')
    t.equal(compiledModule.foo, 'bar')
  })
})

test('resolving using passed babel options', function (t) {
  clearCache()
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../').babelOptions({
      presets: [ require('babel-preset-es2015') ]
    })
    var compiledModulePath = requireCompiled.resolve('./fixtures/es2015')
    var compiledModule = require(compiledModulePath)
    t.equal(compiledModule.foo, 'bar')
  })
})

test('compiled module paths are cached', function (t) {
  clearCache()
  t.plan(3)
  t.doesNotThrow(function () {
    var fs = require('fs')
    var requireCompiled = require('../')

    // Compile the code.
    var compiledModulePath = requireCompiled.resolve('./fixtures/es2015')

    // Delete the compiled file.
    fs.unlinkSync(compiledModulePath)

    // Get the module to the compiled code again.
    var cachedModulePath = requireCompiled.resolve('./fixtures/es2015')

    // Check the module hasn't been compiled again.
    t.equal(compiledModulePath, cachedModulePath, 'Module path is returned from the cache.')
    t.notOk(fs.existsSync(compiledModulePath), 'Module has not been recompiled.')
  })
})

test('multiple requireCompile instances share a cache', function (t) {
  clearCache()
  t.plan(2)
  t.doesNotThrow(function () {
    var fs = require('fs')
    var requireCompiled1 = require('../').babelOptions({
      presets: [ require('babel-preset-es2015') ]
    })
    var requireCompiled2 = require('../').babelOptions({
      presets: [ require('babel-preset-es2015') ]
    })

    // Compile the file using requireCompile1.
    var compiledModulePath = requireCompiled1.resolve('./fixtures/es2015')

    // Clear node's cache to ensure it doesn't interfere with the test.
    delete require.cache[compiledModulePath]

    // Change the compiled code.
    var code = fs.readFileSync(compiledModulePath, { encoding: 'utf8' })
    var changedCode = code.replace(/foo/g, 'superfoo')
    fs.writeFileSync(compiledModulePath, changedCode)

    // Require the file using requireCompile2.
    var compiledModule = requireCompiled2('./fixtures/es2015')

    // Check that we're getting the changed code, not a fresh compilation.
    t.equal(compiledModule.superfoo, 'bar', 'Code is loaded from the cache.')
  })
})

function clearCache () {
  // Clear first level cache.
  require('../')._clearCache()

  // Clear second level cache.
  var fs = require('fs')
  var path = require('path')
  var findCacheDir = require('find-cache-dir')
  var cacheDir = findCacheDir({
    name: 'require-compiled',
    create: true
  })
  var files = fs.readdirSync(cacheDir)
  function fullPath (basename) {
    return path.join(cacheDir, basename)
  }
  files.map(fullPath).forEach(fs.unlinkSync)
}
