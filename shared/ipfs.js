const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI({ host: 'ipfsnode.de', port: '5002', protocol: 'https' })
// const ipfs = ipfsAPI({ : 'ipfs.infura.io', port: '5002', protocol: 'https' })

const request = require('request').defaults({ encoding: null })
const colors = require('colors')

module.exports = {
  addText: text => {
    return new Promise((resolve, reject) => {
      ipfs
        .add(Buffer.from(text))
        .then(resolve)
        .catch(error => {
          console.log(String(error).red)
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
            // Get the IPFS hash without uploading
            ipfs.add(Buffer.from(body), { 'only-hash': true }, (err, check) => {
              ipfs.add(Buffer.from(body), {}, (err, data) => {
                // File was successfully added to IPFs
                if (!err && data[0] && data[0].hash) {
                  console.log(String(url).yellow, ' =>'.cyan, String(data[0].hash).green)
                  resolve(data)
                } else {
                  console.log('NO HASH'.red)
                  resolve([{ hash: check[0].hash }])
                }
              })
              // }
            })
            // } else {
            //   resolve([{hash: '0x'}])
            // }
            // })
          } else {
            // Request to prismic failed
            console.log('request error:'.red, error)
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
