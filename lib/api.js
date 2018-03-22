var body = require('body/json')
var send = require('send-data/json')

var Buyers = require('./models/buyers')

module.exports = {
  post: post,
  get: get,
  route: route
}

function post (req, res, opts, cb) {
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
  Buyers.get(opts.params.key, function (err, data) {
    if (err) return cb(err)
    send(req, res, JSON.parse(data))
  })
}

function route (req, res, opts, cb) {
  Buyers.route(opts, function (err, data) {
    if (err) return cb(err)

    send(req, res, {
      headers: {
        location: data
      },
      statusCode: 302
    })
  })
}
