var babel = require('babel-core')
var findCacheDir = require('find-cache-dir')
var fs = require('fs')
var md5hex = require('md5-hex')
var path = require('path')
var resolve = require('resolve')
var sourceMapSupport = require('source-map-support')
var stack = require('callsite')
var transformRuntime = require('babel-plugin-transform-runtime')
var wrapListener = require('babel-plugin-detective/wrap-listener')

var cacheDir = findCacheDir({
  name: 'require-compiled',
  create: true
})

module.exports = init({ babelrc: true })
module.exports.babelOptions = init

function init (userOptions) {
  var cache = {}

  function requireCompiledResolve (callingFile, modulePath) {
    var filename = resolveModulePath(callingFile, modulePath)

    // First level cache: This requireCompile instance has seen the module before.
    if (cache[filename]) {
      return cache[filename]
    }

    var code = fs.readFileSync(filename)
    var babelOptions = mergeBabelOptions(filename, userOptions)
    var outputPath = getOutputPath(code, babelOptions)

    // Cache output path before compilation, to allow circular dependencies between to-be-compiled files.
    cache[filename] = outputPath

    // Second level cache: The module was already compiled by another requireCompile instance.
    if (!fs.existsSync(outputPath)) {
      var compilationResult = babel.transform(code, babelOptions)
      fs.writeFileSync(outputPath, compilationResult.code)
    }

    return outputPath
  }

  function requireCompiled (modulePath) {
    var callingFile = stack()[1].getFileName()
    var compiledPath = requireCompiledResolve(callingFile, modulePath)
    installSourceMapResultOnce()
    return require(compiledPath)
  }

  function resolveModulePath (callingFile, modulePath) {
    var basedir = path.dirname(callingFile)
    return resolve.sync(
      modulePath,
      { basedir: basedir }
    )
  }

  function getOutputPath (code, babelOptions) {
    return path.join(
      cacheDir,
      md5hex(code + JSON.stringify(babelOptions)) + '.js'
    )
  }

  function mergeBabelOptions (filename, userOptions) {
    var babelOptions = userOptions ? Object.assign({}, userOptions) : {}
    babelOptions.filename = filename
    babelOptions.ast = false
    babelOptions.babelrc = !!userOptions.babelrc
    babelOptions.sourceMaps = userOptions.sourceMaps || 'inline'
    babelOptions.plugins = (userOptions.plugins || []).concat([
      transformRuntime,
      rewriteRequires(filename)
    ])
    return babelOptions
  }

  // Rewrite requires to use absolute paths.
  // This way tests the compiled tests can still be ran from a different directory.
  function rewriteRequires (filename) {
    var basedir = path.dirname(filename)
    return wrapListener(
      function (nodePath) {
        if (nodePath.isLiteral() && !path.isAbsolute(nodePath.node.value)) {
          var match = nodePath.node.value.match(/^compile!(.+)$/)
          nodePath.node.value = match
            ? nodePath.node.value = requireCompiledResolve(filename, match[1])
            : nodePath.node.value = resolve.sync(nodePath.node.value, { basedir: basedir })
        }
      },
      'rewrite-require',
      {
        generated: true,
        require: true,
        import: true
      }
    )
  }

  var sourceMapSupportInstalled = false
  function installSourceMapResultOnce () {
    if (!sourceMapSupportInstalled) {
      sourceMapSupport.install()
      sourceMapSupportInstalled = true
    }
  }

  requireCompiled.resolve = function resolve (modulePath) {
    var callingFile = stack()[1].getFileName()
    return requireCompiledResolve(callingFile, modulePath)
  }

  requireCompiled._clearCache = function clearCache () {
    cache = {}
  }

  return requireCompiled
}
