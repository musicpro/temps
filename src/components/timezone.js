const superagent = require('superagent')
const jQuery = require('jquery')

const store = require('./../utilities/store')
const weather = require('./weather')
const utils = require('./../utilities/utils')
const config = require('./../main/config.json')

let timeoffset = config.timezone.offset

const getTimezone = function () {
  const wdata = store.getWdata()
  
  superagent
      .get(config.timezone.url)
      .query({location: wdata[0].coord.lat + ',' + wdata[0].coord.lon})
      .query({timestamp: Math.floor(Date.now() / 1000)})
      .query({key: config.timezone.apikey})
      .end(function (err, res) {
        console.log(res)
        let loading = utils.getLoading()
        loading[3] = false
        utils.setLoading(loading)
        if (err || !res.ok) {
          utils.showErrorMessage('Failure during data fetching')
        } else {
          if (res.body.status === 'OVER_QUERY_LIMIT') {
            const d = new Date()
            const n = d.getTimezoneOffset()
            timeoffset = n * 60 * -1
          } else {
            timeoffset = res.body.rawOffset + res.body.dstOffset
          }
          jQuery('#details .header .date').html(utils.getTodayDate())
          utils.refreshClock()
          utils.checkLoading()
          weather.showHourlyWeatherData()
        }
      })
}

const convertDateToUTC = function (date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
}

const addSeconds = function (date, seconds) {
  return new Date(date.getTime() + seconds * 1000)
}

const getDate = function (date) {
  // console.log(convertDateToUTC(date))
  return addSeconds(convertDateToUTC(date), timeoffset)
}

const getTimezoneOffset = function () {
  return timeoffset
}

const setTimezoneOffset = function (tz) {
  timeoffset = tz
}

exports.getTimezone = getTimezone
exports.getDate = getDate
exports.getTimezoneOffset = getTimezoneOffset
exports.setTimezoneOffset = setTimezoneOffset
