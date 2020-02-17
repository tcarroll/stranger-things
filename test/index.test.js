/* global require */

const { convertSummary, convertToEpochTime, convertToFloat, transformData } = require('../utils')
const test = require('tap').test

test('Convert summary strips HTML markup and returns first sentence', t => {
  const htmlSummary = '<p>A love letter to the \'80s classics that captivated a generation, <b>Stranger Things</b> is set in 1983 Indiana, where a young boy vanishes into thin air. As friends, family and local police search for answers, they are drawn into an extraordinary mystery involving top-secret government experiments, terrifying supernatural forces and one very strange little girl.</p>'
  const summary = convertSummary(htmlSummary)
  t.equals(
    summary,
    'A love letter to the \'80s classics that captivated a generation, Stranger Things is set in 1983 Indiana, where a young boy vanishes into thin air.')
  t.end()
})

test('Convert to epochal time works', t => {
  const epochalTime = convertToEpochTime('2016-07-15T12:00:00+00:00')
  t.equals(epochalTime, 1468584000)
  t.end()
})

test('Convert to float works', t => {
  t.equals(convertToFloat(6.59876343, 1), 6.6)
  t.equals(convertToFloat(6.45, 1), 6.5)
  t.end()
})

test('Transform data works', t => {
  const source = {
    "id": 2993,
    "runtime": 60,
    _embedded: {
      "episodes": [
        {
          "id": 553946,
          "name": "Chapter One: The Vanishing of Will Byers",
          "season": 1,
          "number": 1,
          "airstamp": "2016-07-15T12:00:00+00:00",
          "summary": "<p>A young boy mysteriously disappears, and his panicked mother demands that the police find him. Meanwhile, the boy's friends conduct their own search, and meet a mysterious girl in the forest.</p>"
        },
        {
          "id": 578663,
          "name": "Chapter Two: The Weirdo on Maple Street",
          "season": 1,
          "number": 2,
          "airstamp": "2016-07-15T12:00:00+00:00",
          "summary": "<p>While the search for the missing Will continues, Joyce tells Jim about a call she apparently received from her son. Meanwhile, Jane warns Mike that there are bad people after her, and he realizes that she knows what happened to Will.</p>",
        },
        {
          "id": 578664,
          "name": "Chapter Three: Holly, Jolly",
          "season": 1,
          "number": 3,
          "airstamp": "2016-07-15T12:00:00+00:00",
          "summary": "<p>While Nancy looks for a missing Barbara and realizes that Jonathan may have been the last person to see her, Mike and his friends go out with Jane to find the missing Will. Meanwhile, Jim tracks Will to the lab.</p>",
        },
        {
          "id": 909340,
          "name": "Chapter One: MADMAX",
          "season": 2,
          "number": 1,
          "airstamp": "2017-10-27T12:00:00+00:00",
          "summary": "<p>One year after the events with the Upside Down and the Demogorgon, Will meets with a government doctor. The boys discover that there's a new player in town, and Jim pays a visit to El.</p>",
        },
        {
          "id": 909342,
          "name": "Chapter Two: Trick or Treat, Freak",
          "season": 2,
          "number": 2,
          "airstamp": "2017-10-27T12:00:00+00:00",
          "summary": "<p>The boys go trick-or-treating on Halloween, and Will has another vision. Meanwhile, El relieves the days following her escape from the Upside Down, and Dustin finds something in the garbage can.</p>",
        }
      ]
    }
  }
  const transformed = transformData(source)
  const { averageEpisodesPerSeason, episodes, totalDurationSec } = transformed['2993']
  const numberOfEpisodes = Object.keys(episodes).length
  console.log('Transformed: ' + JSON.stringify(transformed))
  t.equals(totalDurationSec, numberOfEpisodes * source.runtime)
  t.equals(averageEpisodesPerSeason, 2.5)
  t.end()
})