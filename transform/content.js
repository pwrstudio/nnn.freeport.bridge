const colors = require('colors')
const ipfs = require('../shared/ipfs.js')
const bytes = require('bytes')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Transforming content'.yellow)

    data.transformed.content = []
    let contentPromiseArray = []

    data.transformed.files.map(file => {
      let tempContent = {}
      // ID
      tempContent.id = file.id
      // TITLE
      tempContent.title = file.title
      // MEDIA
      tempContent.media = file.media
      // HASH
      tempContent.hash = file.hash
      // POSTER
      tempContent.poster = file.poster
      // SIZE
      tempContent.size = bytes(file.size)
      // CAPTION
      tempContent.caption = file.caption
      // HIERARCHY
      tempContent.hierarchy = file.hierarchy
      // ORDER 
      if (file.order) {
        tempContent.order = file.order
      }

      // ADD JSON TO IPFS
      let contentPromise = ipfs.addText(JSON.stringify(tempContent))

      contentPromiseArray.push(contentPromise)

      contentPromise.then(ipfs => {
        let baseContent = {}
        if (ipfs && ipfs[0] && ipfs[0].hash) {
          baseContent.hash = ipfs[0].hash
        } else {
          baseContent.hash = ''
        }
        baseContent.id = tempContent.id

        // if (tempContent.media === 'Image set') {
        //   console.log(tempContent)
        // }

        data.transformed.content.push(baseContent)
      })
    })

    Promise.all(contentPromiseArray)
      .then(() => {
        console.log('✓ All content processed'.green)

        resolve(data)
      })
      .catch(err => {
        console.log('content promise rejection'.red, err)

        reject(err)
      })
  })
}
