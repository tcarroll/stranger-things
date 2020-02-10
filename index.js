const http = require('http')

http.get('http://api.tvmaze.com/singlesearch/shows?q=stranger-things&embed=episodes', response => {
  const { statusCode, statusMessage } = response
  if (statusCode === 200) {
    let data = ''
    response.on('data', chunk => {
      data += chunk
    })
    response.on('end', () => {
        let results = transformData(JSON.parse(data))
        console.log(JSON.stringify(results))
    })
  } else {
    console.error(`An error occurred. HTTP status code: ${statusCode}. HTTP status message: ${statusMessage}`)
  }
})

/**
 * Converts a given numeric value to a floating point value with a number of digits after the decimal point.
 * @param {number} number A number.
 * @param {number} precision number of decimal places
 * @returns {number}
 */
const convertToFloat = (number, precision) => {
  console.assert(precision >= 0, 'Number of decimal places cannot be negative')
  const n1 = number * Math.pow(10, precision + 1)
  const n2 = Math.floor(n1 / 10)
  if (n1 >= (n2 * 10 + 5)) {
    return (n2 + 1) / Math.pow(10, precision)
  }
  return n2 / Math.pow(10, precision)
}

const transformData = (object) => {
  const { runtime, id: showId } = object
  let episodes = {}
  let numberOfEpisodes = 0
  let result = {}

  // Maps seasons to the number of episodes in each season.
  let seasonEpisodeCount = []

  // Duration, in seconds, of all episodes
  let totalDurationSeconds = 0

  object._embedded.episodes.forEach(episode => {
    const { airstamp, id, name, number, season } = episode
    episodes[id] = {
      sequenceNumber: `s${season}e${number}`,
      shortTitle: name.slice(name.indexOf(':') + 2),
      airTimestamp: airstamp,
      shortSummary: ''
    }
    if (seasonEpisodeCount.hasOwnProperty(season)) {
      seasonEpisodeCount[season]++
    } else {
      seasonEpisodeCount[season] = 1
    }
    numberOfEpisodes++
    totalDurationSeconds += runtime
  })
  let numberOfSeasons = Object.keys(seasonEpisodeCount).length
  let averageEpisodesPerSeason = numberOfSeasons > 0 ? (numberOfEpisodes / numberOfSeasons ) : 0
  averageEpisodesPerSeason =
    result[showId] = {
      totalDurationSec: totalDurationSeconds,
      averageEpisodesPerSeason: convertToFloat(averageEpisodesPerSeason, 1),
      episodes: episodes
    }
  return result
}