const ipfs = require('../shared/ipfs.js')
const PrismicDOM = require('prismic-dom')
const helpers = require('../shared/helpers.js')
const fs = require('fs')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('- Transforming exhibitions')

    data.transformed.exhibitions = []
    let exhibitionPromiseArray = []

    data.filter(post => post.type === 'exhibition').map(exhibition => {
      let tempExhibition = {}
      tempExhibition.slug = exhibition.slug
      tempExhibition.location = {}

      // TITLE
      if (exhibition.rawJSON.title) {
        tempExhibition.title = PrismicDOM.RichText.asText(exhibition.rawJSON.title)
      }

      // DESCRIPTION
      if (exhibition.rawJSON.description) {
        tempExhibition.description = PrismicDOM.RichText.asHtml(
          exhibition.rawJSON.description,
          helpers.linkResolver
        )
      }

      // START DATE
      if (exhibition.rawJSON.start_date) {
        tempExhibition.start_date = exhibition.rawJSON.start_date
      }

      // END DATE
      if (exhibition.rawJSON.end_date) {
        tempExhibition.end_date = exhibition.rawJSON.end_date
      }

      // FESTIVAL
      if (exhibition.rawJSON.festival) {
        tempExhibition.festival = PrismicDOM.RichText.asText(exhibition.rawJSON.festival)
      }

      // VENUE
      if (exhibition.rawJSON.venue) {
        tempExhibition.location.venue = PrismicDOM.RichText.asText(exhibition.rawJSON.venue)
      }

      // CITY
      if (exhibition.rawJSON.city) {
        tempExhibition.location.city = PrismicDOM.RichText.asText(exhibition.rawJSON.city)
      }

      // COUNTRY
      if (exhibition.rawJSON.country) {
        tempExhibition.location.country = PrismicDOM.RichText.asText(exhibition.rawJSON.country)
      }

      // GEOPOINTS
      if (exhibition.rawJSON.location) {
        tempExhibition.location.geopoint = exhibition.rawJSON.location
      }

      // WORKS
      tempExhibition.works = []
      if (exhibition.rawJSON.works) {
        exhibition.rawJSON.works.map(work => {
          if (work.work) {
            let matchingWork = data.transformed.works.find(e => e.id === work.work.id)
            if (matchingWork) {
              tempExhibition.works.push(matchingWork)
            }
          }
        })
      }

      let exhibitionPromise = ipfs.queueText(JSON.stringify(tempExhibition))

      exhibitionPromiseArray.push(exhibitionPromise)

      // exhibitionPromise
      //   .then(ipfs => {
      //     let baseExhibition = {}

      //     baseExhibition.hash = ipfs[0].hash

      //     data.transformed.exhibitions.push(baseExhibition)
      //   })
      //   .catch(reject)
    })

    Promise.all(exhibitionPromiseArray)
      .then(() => {
        ipfs.addExhibitionQueue().then(exhibitionArray => {
          console.log('\n✓ All exhibitions processed')

          data.transformed.exhibitions = exhibitionArray

          fs.writeFile("exhibitions.json", JSON.stringify(exhibitionArray), (err) => {
            if (err) {
              return console.log(err);
            }

            console.log("The file was saved!");
          })

          resolve(data)
        })
      })
      .catch(err => {
        console.log('exhibition promise rejection', err)

        reject(err)
      })
  })
}
