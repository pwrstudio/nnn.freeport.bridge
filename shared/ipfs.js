const ipfsAPI = require('ipfs-http-client')
// const ipfs = ipfsAPI({ host: 'ipfsnode.de', port: '5002', protocol: 'https' })
// const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
// const ipfs = ipfsAPI({ host: '52.3.226.116', port: '5001', protocol: 'http' })
// const ipfs = ipfsAPI({ host: 'ninetailed.ninja', port: '5001', protocol: 'https' })
// https://ninetailed.ninja/
const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' })

const request = require('request').defaults({ encoding: null })

module.exports = {
  addText: text => {

    // console.log(text)
    // console.log(Buffer.from(text))

    return new Promise((resolve, reject) => {
      ipfs
        .add(Buffer.from(text))
        .then(resolve)
        .catch(error => {
          console.log(String(error))
          reject(error)
        })
    })
  },
  addFile: url => {
    return new Promise((resolve, reject) => {
      // Fallback if url is empty
      if (!url) {
        url = 'http://xxx.xxx'
      }
      // Fetch the file from prismic
      request
        .get(url, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            // Get the IPFS hash without uploading x
            ipfs.add(Buffer.from(body), { 'only-hash': true }, (err, check) => {
              ipfs.add(Buffer.from(body), {}, (err, data) => {
                // File was successfully added to IPFS
                if (!err && data[0] && data[0].hash) {
                  console.log('✔ ', String(url).replace(
                    'https://nnnfreeport.cdn.prismic.io/nnnfreeport/', ''
                  ), ' ===>', String(data[0].hash))
                  resolve(data)
                } else {
                  console.log('!! NO HASH')
                  resolve([{ hash: check[0].hash }])
                }
              })
            })
          } else {
            // Request to prismic failed
            console.log('request error:', error)
            reject(error)
          }
        })
        .on('error', error => {
          // Request to prismic failed
          console.log('on error', error)
          reject(error)
        })
    })
  }
}
