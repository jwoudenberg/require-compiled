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
  function requireCompiledResolve (callingFile, modulePath) {
    var filename = resolveModulePath(callingFile, modulePath)
    var compilationResult = babel.transformFileSync(
      filename,
      mergeBabelOptions(filename, userOptions)
    )
    var outputPath = getOutputPath(filename)
    fs.writeFileSync(
      outputPath,
      compilationResult.code
    )
    return outputPath
  }

  function requireCompiled (modulePath) {
    var callingFile = stack()[1].getFileName()
    var compiledPath = requireCompiledResolve(callingFile, modulePath)
    installSourceMapResultOnce()
    return require(compiledPath)
  }

  requireCompiled.resolve = function (modulePath) {
    var callingFile = stack()[1].getFileName()
    return requireCompiledResolve(callingFile, modulePath)
  }

  return requireCompiled
}

function resolveModulePath (callingFile, modulePath) {
  var basedir = path.dirname(callingFile)
  return resolve.sync(
    modulePath,
    { basedir: basedir }
  )
}

function getOutputPath (filename) {
  return path.join(
    cacheDir,
    md5hex(filename) + '.js'
  )
}

function mergeBabelOptions (filename, userOptions) {
  var babelOptions = userOptions || {}
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
    function (path) {
      path.node.value = resolve.sync(path.node.value, { basedir: basedir })
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
