const colors = require('colors')
const ipfs = require('../shared/ipfs.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('- Transforming exhibitions'.yellow)

    data.transformed.exhibitions = []
    let exhibitionPromiseArray = []

    data.filter(post => post.type === 'exhibition').map(exhibition => {
      let tempExhibition = {}
      tempExhibition.slug = exhibition.slug
      tempExhibition.location = {}

      if (exhibition.data['exhibition.title']) {
        tempExhibition.title = exhibition.data['exhibition.title'].value[0].text
      }

      if (exhibition.data['exhibition.description']) {
        tempExhibition.description = exhibition.data['exhibition.description'].value.text
      }

      if (exhibition.data['exhibition.start_date']) {
        tempExhibition.start_date = exhibition.data['exhibition.start_date'].value
      }

      if (exhibition.data['exhibition.end_date']) {
        tempExhibition.end_date = exhibition.data['exhibition.end_date'].value
      }

      if (exhibition.data['exhibition.festival']) {
        tempExhibition.festival = exhibition.data['exhibition.festival'].value[0].text
      }

      if (exhibition.data['exhibition.venue']) {
        tempExhibition.location.venue = exhibition.data['exhibition.venue'].value[0].text
      }

      if (exhibition.data['exhibition.city']) {
        tempExhibition.location.city = exhibition.data['exhibition.city'].value[0].text
      }

      if (exhibition.data['exhibition.country']) {
        tempExhibition.location.country = exhibition.data['exhibition.country'].value[0].text
      }

      if (exhibition.data['exhibition.location']) {
        tempExhibition.location.geopoint = exhibition.data['exhibition.location'].value
      }

      tempExhibition.works = []

      if (exhibition.data['exhibition.works']) {
        exhibition.data['exhibition.works'].value.map(work => {
          if (work.work && work.work.value) {
            let matchingWork = data.transformed.works.find(
              e => e.id === work.work.value.document.id
            )
            if (matchingWork) {
              tempExhibition.works.push(matchingWork)
            }
          }
        })
      }

      let exhibitionPromise = ipfs.addText(JSON.stringify(tempExhibition))

      exhibitionPromiseArray.push(exhibitionPromise)

      exhibitionPromise
        .then(ipfs => {
          let baseExhibition = {}

          baseExhibition.hash = ipfs[0].hash

          data.transformed.exhibitions.push(baseExhibition)
        })
        .catch(reject)
    })

    Promise.all(exhibitionPromiseArray)
      .then(() => {
        console.log('✓ All exhibitions processed'.green)

        resolve(data)
      })
      .catch(err => {
        console.log('exhibition promise rejection'.red, err)

        reject(err)
      })
  })
}
