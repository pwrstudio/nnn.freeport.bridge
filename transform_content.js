var ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const PrismicDOM = require('prismic-dom')
const toMarkdown = require('to-markdown')
const request = require('request').defaults({encoding: null})

const addText = text => {
  return new Promise((resolve, reject) => {
    ipfs
      .add(Buffer.from(text))
      .then(resolve)
      .catch(reject)
  })
}

const addFile = url => {
  return new Promise((resolve, reject) => {
    request.get(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        ipfs
          .add(Buffer.from(body))
          .then(resolve)
          .catch(reject)
      }
    })
  })
}

const transformFiles = data => {
  return new Promise((resolve, reject) => {
    data.transformed.files = []
    let contentPromiseArray = []
    data.filter(post => post.type === 'content').map(contentPost => {
      let tempContent = {}
      tempContent.title = contentPost.data['content.title'].value[0].text
      tempContent.media = contentPost.data['content.content_type'].value
      tempContent.id = contentPost.id
      if (tempContent.media === 'Text') {
        // TODO: convert text object to markdown
        let textPromise = addText(
          toMarkdown(PrismicDOM.RichText.asHtml(contentPost.data['content.text'].value))
        )
        contentPromiseArray.push(textPromise)
        textPromise.then(ipfs => {
          tempContent.ipfs = ipfs
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Image') {
        let filePromise = addFile(contentPost.data['content.image'].value.main.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Audio') {
        let filePromise = addFile(contentPost.data['content.audio'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Video') {
        let filePromise = addFile(contentPost.data['content.video'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'File') {
        let filePromise = addFile(contentPost.data['content.file'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
      }
    })
    Promise.all(contentPromiseArray)
      .then(() => {
        resolve(
          data.sort((a, b) => {
            if (a.id < b.id) {
              return -1
            }
            if (a.id > b.id) {
              return 1
            }
            return 0
          })
        )
      })
      .catch(reject)
  })
}

const transformContent = data => {
  return new Promise((resolve, reject) => {
    data.transformed.content = []
    let contentPromiseArray = []
    data.transformed.files.map(file => {
      let tempContent = {}
      tempContent.id = file.id
      tempContent.title = file.title
      tempContent.hash = file.hash
      let contentPromise = addText(JSON.stringify(tempContent))
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
        resolve(
          data.sort((a, b) => {
            if (a.id < b.id) {
              return -1
            }
            if (a.id > b.id) {
              return 1
            }
            return 0
          })
        )
      })
      .catch(reject)
  })
}

const transformWorks = data => {
  return new Promise((resolve, reject) => {
    data.transformed.works = []
    let workPromiseArray = []
    data.filter(post => post.type === 'work').map(work => {
      let tempWork = {}
      tempWork.id = work.id
      tempWork.title = work.data['work.title'].value[0].text
      tempWork.date = work.data['work.publication_time'].value
      tempWork.artists = []
      work.data['work.artists'].value.map(artist => {
        tempWork.artists.push(artist.artis.value[0].text)
      })
      tempWork.content = []
      work.data['work.content'].value.map(content => {
        if (content.content_item && content.content_item.value) {
          let matchingContent = data.transformed.content.find(
            e => e.id === content.content_item.value.document.id
          )
          if (matchingContent) {
            tempWork.content.push(matchingContent)
          }
        }
      })
      let workPromise = addText(JSON.stringify(tempWork))
      workPromiseArray.push(workPromise)
      workPromise.then(ipfs => {
        let baseWork = {}
        baseWork.hash = ipfs[0].hash
        baseWork.id = tempWork.id
        data.transformed.works.push(baseWork)
      })
    })
    Promise.all(workPromiseArray)
      .then(() => {
        resolve(
          data.sort((a, b) => {
            if (a.id < b.id) {
              return -1
            }
            if (a.id > b.id) {
              return 1
            }
            return 0
          })
        )
      })
      .catch(reject)
  })
}

const transformExhibitions = data => {
  return new Promise((resolve, reject) => {
    data.transformed.exhibitions = []
    let exhibitionPromiseArray = []
    data.filter(post => post.type === 'exhibition').map(exhibition => {
      let tempExhibition = {}
      tempExhibition.slug = exhibition.slug
      tempExhibition.location = {}
      tempExhibition.title = exhibition.data['exhibition.title'].value[0].text
      tempExhibition.description = exhibition.data['exhibition.description'].value.text
      tempExhibition.start_date = exhibition.data['exhibition.start_date'].value
      tempExhibition.end_date = exhibition.data['exhibition.end_date'].value
      tempExhibition.festival = exhibition.data['exhibition.festival'].value[0].text
      tempExhibition.location.venue = exhibition.data['exhibition.venue'].value[0].text
      tempExhibition.location.city = exhibition.data['exhibition.city'].value[0].text
      tempExhibition.location.country = exhibition.data['exhibition.country'].value[0].text
      tempExhibition.location.geopoint = exhibition.data['exhibition.location'].value
      tempExhibition.works = []
      exhibition.data['exhibition.works'].value.map(work => {
        if (work.work && work.work.value) {
          let matchingWork = data.transformed.works.find(e => e.id === work.work.value.document.id)
          if (matchingWork) {
            tempExhibition.works.push(matchingWork)
          }
        }
      })
      let exhibitionPromise = addText(JSON.stringify(tempExhibition))
      exhibitionPromiseArray.push(exhibitionPromise)
      exhibitionPromise.then(ipfs => {
        let baseExhibition = {}
        baseExhibition.hash = ipfs[0].hash
        data.transformed.exhibitions.push(baseExhibition)
      })
    })
    Promise.all(exhibitionPromiseArray)
      .then(() => {
        data.transformed.works.map(e => delete e.id)
        data.transformed.content.map(e => delete e.id)
        delete data.transformed.files
        resolve(data)
      })
      .catch(reject)
  })
}

module.exports = data => {
  return new Promise((resolve, reject) => {
    data.transformed = {}
    transformFiles(data)
      .then(transformContent)
      .then(transformWorks)
      .then(transformExhibitions)
      .then(data => {
        resolve(data.transformed)
      })
      .catch(console.log)
  })
}
