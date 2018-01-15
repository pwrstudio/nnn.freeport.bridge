var ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const colors = require('colors')
const Spinner = require('cli-spinner').Spinner

module.exports = transformedContent => {
  // PROGRESS UPDATE
  const spinner = new Spinner('%s Writing root document'.yellow)
  spinner.start()
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    ipfs
      .add(Buffer.from(JSON.stringify(transformedContent)))
      .then(data => {
        if (data[0] && data[0].hash) {
          spinner.stop()
          resolve(data[0].hash)
        } else {
          reject()
        }
      })
      .catch(reject)
  })
}
