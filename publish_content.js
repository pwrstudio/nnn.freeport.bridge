const IPFS = require('ipfs-mini')
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

module.exports = transformedContent => {
  return new Promise((resolve, reject) => {
    ipfs.addJSON(transformedContent, (err, result) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
