var body = require('body/json')
var send = require('send-data/json')

var Buyers = require('./models/buyers')

module.exports = {
  put: put,
  get: get,
  route: route
}

function put (req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)
    Buyers.put(data, function (err) {
      if (err) return cb(err)
      res.statusCode = 201
      send(req, res, data)
    })
  })
}

function get (req, res, opts, cb) {
  Buyers.get(opts.params.key, function (err, buyer) {
    if (err) return cb(err)
    send(req, res, JSON.parse(buyer))
  })
}

function route (req, res, opts, cb) {
  Buyers.route(opts, function (err, location) {
    if (err) return cb(err)

    send(req, res, {
      headers: {
        location: location
      },
      statusCode: 302
    })
  })
}
