var test = require('tape')

test('control test: requiring without necessary preset', function (t) {
  t.plan(1)
  t.throws(function () {
    var requireCompiled = require('../').babelOptions({
      presets: []
    })
    requireCompiled('./fixtures/es2015')
  })
})

test('requiring using user .babelrc', function (t) {
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../')
    var compiledModule = requireCompiled('./fixtures/es2015')
    t.equal(compiledModule.foo, 'bar')
  })
})

test('resolving using user .babelrc', function (t) {
  t.plan(2)
  t.doesNotThrow(function () {
    var requireCompiled = require('../')
    var compiledModulePath = requireCompiled.resolve('./fixtures/es2015')
    var compiledModule = require(compiledModulePath)
    t.equal(compiledModule.foo, 'bar')
  })
})

test('requiring using passed babel options', function (t) {
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
