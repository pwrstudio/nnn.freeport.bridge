const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const request = require('request').defaults({encoding: null})
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
      if (!url) {
        url = 'http://via.placeholder.com/350x150'
      }
      request
        .get(url, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            ipfs.add(
              Buffer.from(body),
              {
                progress: data => console.log(String(url).yellow, data, '/', body.length)
              },
              (err, data) => {
                console.log(err, data)
                if (!err && data[0] && data[0].hash) {
                  console.log(String(url).yellow, ' =>'.cyan, String(data[0].hash).green)
                  console.count('finished'.green)

                  resolve(data)
                } else {
                  console.log('NO HASH'.red)
                  console.log(data)
                  console.log(err)
                  console.log(String(url).red)
                  console.log(Buffer.from(body).length)
                  resolve([{hash: '0x'}])
                }
              }
            )
          } else {
            console.log('request error:'.red, error)

            reject(error)
          }
        })
        .on('error', error => {
          console.log('on error', error)

          reject(error)
        })
    })
  }
}
