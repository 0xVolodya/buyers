var db = require('../db')

exports.put = function (buyer, cb) {
  buyer.offers.forEach(function (offer) {
    offer.criteria.device.forEach(function (device) {
      db.sadd(getDeviceById(device), offer.location)
    })

    offer.criteria.hour.forEach(function (hour) {
      db.sadd(getHourById(hour), offer.location)
    })

    offer.criteria.day.forEach(function (day) {
      db.sadd(getDayById(day), offer.location)
    })

    offer.criteria.state.forEach(function (state) {
      db.sadd(getStateById(state), offer.location)
    })

    db.zadd('location', offer.value, offer.location)
  })

  db.set(getBuyerById(buyer.id), JSON.stringify(buyer), cb)
}

exports.get = function (buyerID, cb) {
  db.get(getBuyerById(buyerID), cb)
}

exports.route = function (opts, cb) {
  var query = opts.query
  var date = new Date(query.timestamp)
  var device = query.device
  var state = query.state
  var hour = date.getUTCHours()
  var day = date.getUTCDay()

  var multi = db.multi()
  multi
    .zrange('location', 0, -1)
    .sinter(
      getDeviceById(device),
      getHourById(hour),
      getDayById(day),
      getStateById(state)
    )
    .exec(function (err, result) {
      if (err) return cb(err)
      var sortedLocations = result[0]
      var allowedLocations = result[1]
      var highestLocation = findHighestAllowedLocation(sortedLocations.reverse(), allowedLocations)

      cb(null, highestLocation)
    })
}

function getBuyerById (buyerId) {
  return 'buyers:' + buyerId
}

function getDeviceById (deviceId) {
  return 'device:' + deviceId
}

function getHourById (hourId) {
  return 'hour:' + hourId
}

function getDayById (dayId) {
  return 'day:' + dayId
}

function getStateById (stateId) {
  return 'state:' + stateId
}

function findHighestAllowedLocation (sortedLocations, allowedLocations) {
  return sortedLocations.find(function (location) {
    return allowedLocations.some(function (allowedLocation) {
      return location === allowedLocation
    })
  })
}
