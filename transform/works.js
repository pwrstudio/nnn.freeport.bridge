const colors = require('colors')
const ipfs = require('../shared/ipfs.js')
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

      // TITLE
      tempWork.title = ''
      if (work.data['work.title']) {
        tempWork.title = work.data['work.title'].value[0].text
      }

      // DESCRIPTION
      tempWork.description = ''
      if (work.data['work.description']) {
        tempWork.description = work.data['work.description'].value[0].text
      }

      // PUBLISHING TIME
      tempWork.date = 0
      if (work.data['work.publication_time']) {
        tempWork.date = work.data['work.publication_time'].value
      }

      // ARTISTS
      tempWork.artists = []
      console.log(work.data['work.artists'])
      if (work.data['work.artists'] && work.data['work.artists'].value) {
        work.data['work.artists'].value.map(artist => {
          if (artist && artist.artis && artist.artis.value && artist.artis.value[0]) {
            tempWork.artists.push(artist.artis.value[0].text)
          }
        })
      }

      // CONTENT
      tempWork.content = []
      if (work.data['work.content'] && work.data['work.content'].value) {
        work.data['work.content'].value.map(content => {
          if (content.content_item && content.content_item.value) {
            let matchingContent = data.transformed.content.find(
              e => e.id === content.content_item.value.document.id
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
