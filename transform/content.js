const colors = require('colors')
const ipfs = require('../shared/ipfs.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Transforming content'.yellow)

    data.transformed.content = []
    let contentPromiseArray = []

    data.transformed.files.map(file => {
      let tempContent = {}
      tempContent.id = file.id
      tempContent.title = file.title
      tempContent.media = file.media
      tempContent.hash = file.hash

      let contentPromise = ipfs.addText(JSON.stringify(tempContent))

      contentPromiseArray.push(contentPromise)

      contentPromise.then(ipfs => {
        let baseContent = {}
        baseContent.hash = ipfs[0].hash
        baseContent.id = tempContent.id

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
