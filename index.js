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
 * Converts an episode summary that is HTML content to a sentence with no markup.
 * @param {string} summary HTML markup that describes an episode.
 * @returns {string}
 */
const convertSummary = summary => {
  return stripMarkup(summary.slice(0, summary.indexOf('.') + 1))
}

const stripMarkup = markup => {
  let startTag = markup.indexOf('<')
  if (startTag >= 0) {
    let endTag = markup.slice(startTag + 1).indexOf('>')
    if (endTag >= 0) {
      return stripMarkup(markup.slice(endTag + 2))
    }
  }
  return markup
}

/**
 * Coverts an ISO date time stamp string into an epochal time number of seconds.
 * @param {string} timestamp  An ISO data time stamp.
 * @return {number} The epochal (in seconds) time of the given timestamp.
 */
const convertToEpochTime = (timestamp) => {
  return new Date(timestamp).getTime()
}

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
    const { airstamp, id, name, number, season, summary } = episode
    episodes[id] = {
      sequenceNumber: `s${season}e${number}`,
      shortTitle: name.slice(name.indexOf(':') + 2),
      airTimestamp: convertToEpochTime(airstamp),
      shortSummary: convertSummary(summary || '')
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