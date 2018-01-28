const colors = require('colors')
const ipfs = require('../shared/ipfs.js')
const PrismicDOM = require('prismic-dom')
const helpers = require('../shared/helpers.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Transforming works'.yellow)

    data.transformed.works = []
    let workPromiseArray = []

    // MAP OVER ALL WORKS
    data.filter(post => post.type === 'work').map(work => {
      let tempWork = {}
      tempWork.id = work.id

      // console.log(JSON.stringify(work, null, 4))

      // TITLE
      tempWork.title = ''
      if (work.rawJSON.title) {
        tempWork.title = PrismicDOM.RichText.asText(work.rawJSON.title)
      }

      // DESCRIPTION
      tempWork.description = ''
      if (work.rawJSON.description) {
        tempWork.description = PrismicDOM.RichText.asHtml(
          work.rawJSON.description,
          helpers.linkResolver
        )
      }

      // PUBLISHING TIME
      tempWork.date = 0
      if (work.rawJSON.publication_time) {
        tempWork.date = work.rawJSON.publication_time
      }

      // ARTISTS
      tempWork.artists = []
      if (work.rawJSON.artists) {
        work.rawJSON.artists.map(artist => {
          if (artist.artis) {
            tempWork.artists.push(PrismicDOM.RichText.asText(artist.artis))
          }
        })
      }

      // CONTENT
      tempWork.content = []
      if (work.rawJSON.content) {
        work.rawJSON.content.map(content => {
          if (content.content_item) {
            let matchingContent = data.transformed.content.find(
              e => e.id === content.content_item.id
            )
            if (matchingContent) {
              tempWork.content.push(matchingContent)
            }
          }
        })
      }

      // ADD JSON TO IPFS
      let workPromise = ipfs.addText(JSON.stringify(tempWork))

      workPromiseArray.push(workPromise)

      workPromise.then(ipfs => {
        let baseWork = {}
        baseWork.hash = ipfs[0].hash
        baseWork.id = tempWork.id
        data.transformed.works.push(baseWork)
      })
    })

    Promise.all(workPromiseArray)
      .then(() => {
        console.log('✓ All works processed'.green)

        resolve(data)
      })
      .catch(err => {
        console.log('work promise rejection'.red, err)

        reject(err)
      })
  })
}
