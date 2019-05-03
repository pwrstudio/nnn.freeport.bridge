const async = require('async')
const _cliProgress = require('cli-progress')
const logUpdate = require('log-update')
const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
// const ipfs = ipfsAPI({ host: '52.3.226.116', port: '5001', protocol: 'https' })
// const ipfs = ipfsAPI({ host: '3.92.152.160', port: '5001' })
// const ipfs = ipfsAPI({ host: 'localhost', port: '5001', protocol: 'http' })

const request = require('request').defaults({ encoding: null })

var queue = []

module.exports = {

  queueText: baseContent => {

    // console.log('&&&& QUEUE TEXT:', baseContent)

    return new Promise((resolve, reject) => {
      queue.push({ type: 'text', baseContent: baseContent })
      resolve()
    })

  },
  queueFile: baseContent => {

    // console.log('&&&& QUEUE File:', baseContent)

    return new Promise((resolve, reject) => {
      queue.push({ type: 'file', baseContent: baseContent })
      resolve()
    })

  },
  addContentQueue: () => {
    var contentArray = []

    return new Promise((resolve, reject) => {

      // Initialize progressbar
      const bar1 = new _cliProgress.Bar({
        format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | hash: {hash}'
      }, _cliProgress.Presets.shades_grey)

      bar1.start(queue.length, 0, {
        hash: '...'
      })

      // Add queue sequentially
      async.eachOfSeries(queue, (q, i, cb) => {

        // Add text
        // console.log(q.baseContent)

        ipfs.add(Buffer.from(JSON.stringify(q.baseContent)), {}, (err, data) => {
          if (err) {
            console.log('ADD failed:', err)
          } else {

            // Update progressbar
            bar1.update(i, {
              hash: String(data[0].hash)
            })

            // Remove text, add hash
            var tempContent = {
              id: q.baseContent.id,
              hash: data[0].hash
            }

            // Push to compiled array
            contentArray.push(tempContent)

            cb()
          }
        })

      }, (err) => {
        if (err) {
          console.log('async error:', q)
          reject(err)
        } else {
          // DONE
          queue = []
          bar1.stop()
          resolve(contentArray)
        }
      })

    })

  },
  addFileQueue: () => {

    var fileArray = []

    return new Promise((resolve, reject) => {

      // Initialize progressbar
      const bar1 = new _cliProgress.Bar({
        format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | hash: {hash}'
      }, _cliProgress.Presets.shades_grey)

      bar1.start(queue.length, 0, {
        hash: '...'
      })

      // Add queue sequentially
      async.eachOfSeries(queue, (q, i, cb) => {

        // Add text
        if (q.type === 'text') {

          console.log(q.baseContent)

          if (q.baseContent.poster) {
            console.log(q.baseContent.poster)
            request
              .get(q.baseContent.poster, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                  // Get the IPFS hash without uploading x
                  ipfs.add(Buffer.from(body), {}, (err, posterData) => {
                    // File was successfully added to IPFS
                    if (!err && posterData[0] && posterData[0].hash) {

                      // Add poster hash
                      q.baseContent.poster = posterData[0].hash

                      ipfs.add(Buffer.from(q.baseContent.text), {}, (err, textData) => {
                        if (err) {
                          console.log('ADD failed:', err)
                        } else {

                          // Update progressbar
                          bar1.update(i, {
                            hash: String(textData[0].hash)
                          })

                          // Remove text, add hash
                          delete q.baseContent.text
                          q.baseContent.hash = textData[0].hash
                          q.baseContent.size = textData[0].size

                          // Push to compiled array
                          fileArray.push(q.baseContent)

                          cb()
                        }
                      })

                    } else {
                      console.log('!! NO HASH')
                      cb()
                    }
                  })
                } else {
                  // Request to prismic failed
                  console.log('request error:', error)
                  cb()
                  // reject(error)
                }
              })
              .on('error', error => {
                // Request to prismic failed
                console.log('Prismic error', error)
                cb()
              })

          } else {

            ipfs.add(Buffer.from(q.baseContent.text), {}, (err, data) => {
              if (err) {
                console.log('ADD failed:', err)
              } else {

                // Update progressbar
                bar1.update(i, {
                  hash: String(data[0].hash)
                })

                // Remove text, add hash
                delete q.baseContent.text
                q.baseContent.hash = data[0].hash
                q.baseContent.size = data[0].size

                // Push to compiled array
                fileArray.push(q.baseContent)

                cb()
              }
            })
          }

          // Add file
        } else if (q.type === 'file') {

          console.log(q.baseContent)

          if (q.baseContent.poster) {

            request
              .get(q.baseContent.poster, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                  // Get the IPFS hash without uploading x
                  ipfs.add(Buffer.from(body), {}, (err, posterData) => {
                    // File was successfully added to IPFS
                    if (!err && posterData[0] && posterData[0].hash) {

                      // Add poster hash
                      q.baseContent.poster = posterData[0].hash

                      request
                        .get(q.baseContent.url, (error, response, body) => {
                          if (!error && response.statusCode == 200) {
                            // Get the IPFS hash without uploading x
                            ipfs.add(Buffer.from(body), {}, (err, fileData) => {
                              // File was successfully added to IPFS
                              if (!err && fileData[0] && fileData[0].hash) {

                                // Update progressbar
                                bar1.update(i, {
                                  hash: String(fileData[0].hash)
                                })

                                // Remove text, add hash
                                delete q.baseContent.url
                                q.baseContent.hash = fileData[0].hash
                                q.baseContent.size = fileData[0].size

                                // Push to compiled array
                                fileArray.push(q.baseContent)

                                cb()
                              } else {
                                console.log('!! NO HASH')
                                cb()
                              }
                            })
                          } else {
                            // Request to prismic failed
                            console.log('request error:', error)
                            cb()
                            // reject(error)
                          }
                        })
                        .on('error', error => {
                          // Request to prismic failed
                          console.log('Prismic error', error)
                          cb()
                        })

                    } else {
                      console.log('!! NO HASH')
                      cb()
                    }
                  })
                } else {
                  // Request to prismic failed
                  console.log('request error:', error)
                  cb()
                  // reject(error)
                }
              })
              .on('error', error => {
                // Request to prismic failed
                console.log('Prismic error', error)
                cb()
              })

          } else {

            request
              .get(q.baseContent.url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                  // Get the IPFS hash without uploading x
                  ipfs.add(Buffer.from(body), {}, (err, data) => {
                    // File was successfully added to IPFS
                    if (!err && data[0] && data[0].hash) {

                      // Update progressbar
                      bar1.update(i, {
                        hash: String(data[0].hash)
                      })

                      // Remove text, add hash
                      delete q.baseContent.url
                      q.baseContent.hash = data[0].hash

                      // Push to compiled array
                      fileArray.push(q.baseContent)

                      cb()
                    } else {
                      console.log('!! NO HASH')
                      cb()
                    }
                  })
                } else {
                  // Request to prismic failed
                  console.log('request error:', error)
                  cb()
                  // reject(error)
                }
              })
              .on('error', error => {
                // Request to prismic failed
                console.log('Prismic error', error)
                cb()
              })

          }
        }
      }, (err) => {
        if (err) {
          console.log('async error:', q)
          reject(err)
        } else {
          // DONE
          queue = []
          bar1.stop()
          resolve(fileArray)
        }
      })

    })
  },
  addWorkQueue: () => {
    var workArray = []

    return new Promise((resolve, reject) => {

      // Initialize progressbar
      const bar1 = new _cliProgress.Bar({
        format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | hash: {hash}'
      }, _cliProgress.Presets.shades_grey)

      bar1.start(queue.length, 0, {
        hash: '...'
      })

      // Add queue sequentially
      async.eachOfSeries(queue, (q, i, cb) => {

        // Add text
        // console.log(q.baseContent)

        ipfs.add(Buffer.from(JSON.stringify(q.baseContent)), {}, (err, data) => {
          if (err) {
            console.log('ADD failed:', err)
          } else {

            // Update progressbar
            bar1.update(i, {
              hash: String(data[0].hash)
            })

            // Remove text, add hash
            var tempContent = {
              hash: data[0].hash
            }

            // Push to compiled array
            workArray.push(tempContent)

            cb()
          }
        })

      }, (err) => {
        if (err) {
          console.log('async error:', q)
          reject(err)
        } else {
          // DONE
          queue = []
          bar1.stop()
          resolve(workArray)
        }
      })

    })

  },
  addExhibitionQueue: () => {
    var exhibitionArray = []

    return new Promise((resolve, reject) => {

      // Initialize progressbar
      const bar1 = new _cliProgress.Bar({
        format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | hash: {hash}'
      }, _cliProgress.Presets.shades_grey)

      bar1.start(queue.length, 0, {
        hash: '...'
      })

      // Add queue sequentially
      async.eachOfSeries(queue, (q, i, cb) => {

        // Add text
        // console.log(q.baseContent)

        ipfs.add(Buffer.from(JSON.stringify(q.baseContent)), {}, (err, data) => {
          if (err) {
            console.log('ADD failed:', err)
          } else {

            // Update progressbar
            bar1.update(i, {
              hash: String(data[0].hash)
            })

            // Remove text, add hash
            var tempContent = {
              hash: data[0].hash
            }

            // Push to compiled array
            exhibitionArray.push(tempContent)

            cb()
          }
        })

      }, (err) => {
        if (err) {
          console.log('async error:', q)
          reject(err)
        } else {
          // DONE
          queue = []
          bar1.stop()
          resolve(exhibitionArray)
        }
      })

    })

  },
  addText: text => {

    return new Promise((resolve, reject) => {

      ipfs
        .add(Buffer.from(text), {}, (err, res) => {
          if (err) {
            // console.log(err)
            reject(err)
          } else {
            console.log(res)
            resolve(res)
          }
        })

    })
  },
  addFile: url => {

    return new Promise((resolve, reject) => {
      // Fallback if url is empty
      if (!url) {
        url = 'http://xxx.xxx'
      }

      // resolve([{ hash: 'XXX' }])

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
