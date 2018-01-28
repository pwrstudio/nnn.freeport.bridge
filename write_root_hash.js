const colors = require('colors')
const ipfs = require('./shared/ipfs.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Writing root document'.yellow)

    // Add timestamp
    data.transformed.updated = new Date()

    ipfs
      .addText(Buffer.from(JSON.stringify(data.transformed)))
      .then(data => {
        if (data[0] && data[0].hash) {
          resolve(data[0].hash)
        } else {
          reject()
        }
      })
      .catch(reject)
  })
}
