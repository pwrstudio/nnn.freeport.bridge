var ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const uuidv4 = require('uuid/v4')

module.exports = transformedContent => {
  return new Promise((resolve, reject) => {
    ipfs
      .add(Buffer.from(JSON.stringify(transformedContent)))
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
