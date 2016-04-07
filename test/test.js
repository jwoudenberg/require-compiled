var requireCompiled = require('../')()
var myModule = requireCompiled('./my-module')
myModule()
console.log(requireCompiled.resolve('./my-module'))
