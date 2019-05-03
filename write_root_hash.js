const ipfs = require('./shared/ipfs.js')
const fs = require('fs')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('– Writing root document')

    // Add timestamp
    data.transformed.updated = new Date()

    fs.writeFile("root.json", JSON.stringify(data.transformed), (err) => {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    })

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
