var redis = require('../src/redis')
var db = redis()

db.healthCheck = function (cb) {
  var now = Date.now()
  db.set('!healthCheck', now, function (err) {
    if (err) return cb(err)
    db.get('!healthCheck', function (err, then) {
      if (err) return cb(err)
      if (now !== then) return cb(new Error('DB write failed'))
      cb()
    })
  })
}

module.exports = db
