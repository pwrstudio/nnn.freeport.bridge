const ipfs = require('../shared/ipfs.js')
const PrismicDOM = require('prismic-dom')
const helpers = require('../shared/helpers.js')
const fs = require('fs')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Transforming works')

    data.transformed.works = []
    let workPromiseArray = []

    // MAP OVER ALL WORKS
    data.filter(post => post.type === 'work').map(work => {
      let tempWork = {}
      tempWork.id = work.id

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
        console.log('title', tempWork.title, work.rawJSON.content.length)
        work.rawJSON.content.map(content => {
          let matchingContent = data.transformed.content.filter(
            e => e.id === content.content_item.id
          )
          if (matchingContent) {
            matchingContent.forEach(c => tempWork.content.push(c))
          }
        })
      }

      // console.log(tempWork)

      // ADD JSON TO IPFS
      let workPromise = ipfs.queueText(tempWork)

      workPromiseArray.push(workPromise)

    })

    Promise.all(workPromiseArray)
      .then(() => {
        ipfs.addWorkQueue().then(workArray => {
          console.log('\n✓ All works processed:', workArray.length)

          fs.writeFile("work.json", JSON.stringify(workArray), (err) => {
            if (err) {
              return console.log(err);
            }

            console.log("The file was saved!");
          })

          data.transformed.works = workArray

          resolve(data)
        })
      })
      .catch(err => {
        console.log('work promise rejection', err)

        reject(err)
      })
  })
}
