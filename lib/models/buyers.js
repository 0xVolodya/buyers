var db = require('../db')

module.exports = {
  put: put,
  get: get,
  route: route
}

function put (buyer, cb) {
  var multi = db.multi()
  buyer.offers.forEach(function (offer) {
    var criteria = offer.criteria
    if (criteria.device !== undefined) {
      criteria.device.forEach(function (device) {
        multi.sadd(getDeviceById(device), offer.location)
      })
    }

    if (criteria.hour !== undefined) {
      criteria.hour.forEach(function (hour) {
        multi.sadd(getHourById(hour), offer.location)
      })
    }
    if (criteria.day !== undefined) {
      criteria.day.forEach(function (day) {
        multi.sadd(getDayById(day), offer.location)
      })
    }
    if (criteria.state !== undefined) {
      criteria.state.forEach(function (state) {
        multi.sadd(getStateById(state), offer.location)
      })
    }

    multi.zadd('location', offer.value, offer.location)
  })

  multi.set(getBuyerById(buyer.id), JSON.stringify(buyer))
  multi.exec(cb)
}

function get (buyerID, cb) {
  db.get(getBuyerById(buyerID), cb)
}

function route (opts, cb) {
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
      var sortedLocations = result[0].reverse()
      var allowedLocations = result[1]
      var highestLocation = findHighestAllowedLocation(sortedLocations, allowedLocations)

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
