var server = require('./lib/server')
var name = require('./package.json').name

var port = process.env.PORT | 3000

server().listen(port)
console.log(name, 'listening on port', port)
