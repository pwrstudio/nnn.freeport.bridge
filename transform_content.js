var ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const PrismicDOM = require('prismic-dom')
const toMarkdown = require('to-markdown')
const request = require('request').defaults({encoding: null})
const colors = require('colors')
const Spinner = require('cli-spinner').Spinner

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
  // PROGRESS UPDATE
  console.log('Transforming files...'.yellow)
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    data.transformed.files = []
    let contentPromiseArray = []
    data.filter(post => post.type === 'content').map(contentPost => {
      let tempContent = {}
      if (contentPost.data['content.title']) {
        tempContent.title = contentPost.data['content.title'].value[0].text
      }
      if (contentPost.data['content.content_type']) {
        tempContent.media = contentPost.data['content.content_type'].value
      }
      tempContent.id = contentPost.id
      if (tempContent.media === 'Text') {
        // PROGRESS UPDATE
        let textSpinner = new Spinner('%s Text'.cyan)
        textSpinner.start()
        // PROGRESS UPDATE
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
          textSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Image') {
        // PROGRESS UPDATE
        let imageSpinner = new Spinner('%s Image'.cyan)
        imageSpinner.start()
        // PROGRESS UPDATE
        let filePromise = addFile(contentPost.data['content.image'].value.main.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          imageSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Audio') {
        // PROGRESS UPDATE
        let audioSpinner = new Spinner('%s Audio'.cyan)
        audioSpinner.start()
        // PROGRESS UPDATE
        let filePromise = addFile(contentPost.data['content.audio'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          audioSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'Video') {
        // PROGRESS UPDATE
        let videoSpinner = new Spinner('%s Video'.cyan)
        // PROGRESS UPDATE
        let filePromise = addFile(contentPost.data['content.video'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          videoSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'File') {
        // PROGRESS UPDATE
        let fileSpinner = new Spinner('%s File'.cyan)
        fileSpinner.start()
        // PROGRESS UPDATE
        let filePromise = addFile(contentPost.data['content.file'].value.file.url)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          fileSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      } else if (tempContent.media === 'External link') {
        // PROGRESS UPDATE
        let linkSpinner = new Spinner('%s Link'.cyan)
        linkSpinner.start()
        // PROGRESS UPDATE
        let linkPromise = addText(contentPost.data['content.external_link'].value.url)
        contentPromiseArray.push(linkPromise)
        linkPromise.then(ipfs => {
          tempContent.ipfs = ipfs
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          linkSpinner.stop()
          data.transformed.files.push(baseContent)
        })
      }
    })
    Promise.all(contentPromiseArray)
      .then(() => {
        console.log('\n✓ All files processed'.green)
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
  // PROGRESS UPDATE
  const spinner = new Spinner('%s Transforming content'.yellow)
  spinner.start()
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    data.transformed.content = []
    let contentPromiseArray = []
    data.transformed.files.map(file => {
      let tempContent = {}
      tempContent.id = file.id
      tempContent.title = file.title
      tempContent.media = file.media
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
        console.log('\n✓ All content processed'.green)
        spinner.stop()
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
  // PROGRESS UPDATE
  const spinner = new Spinner('%s Transforming works'.yellow)
  spinner.start()
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    data.transformed.works = []
    let workPromiseArray = []
    data.filter(post => post.type === 'work').map(work => {
      let tempWork = {}
      tempWork.id = work.id
      if (work.data['work.title']) {
        tempWork.title = work.data['work.title'].value[0].text
      }
      if (work.data['work.publication_time']) {
        tempWork.date = work.data['work.publication_time'].value
      } else {
        tempWork.date = 0
      }
      tempWork.artists = []
      if (work.data['work.artists']) {
        work.data['work.artists'].value.map(artist => {
          tempWork.artists.push(artist.artis.value[0].text)
        })
      }
      tempWork.content = []
      if (work.data['work.content']) {
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
      }
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
        console.log('\n✓ All works processed'.green)
        spinner.stop()
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
  // PROGRESS UPDATE
  const spinner = new Spinner('%s Transforming exhibitions'.yellow)
  spinner.start()
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    data.transformed.exhibitions = []
    let exhibitionPromiseArray = []
    data.filter(post => post.type === 'exhibition').map(exhibition => {
      let tempExhibition = {}
      tempExhibition.slug = exhibition.slug
      tempExhibition.location = {}
      if (exhibition.data['exhibition.title']) {
        tempExhibition.title = exhibition.data['exhibition.title'].value[0].text
      }
      if (exhibition.data['exhibition.description']) {
        tempExhibition.description = exhibition.data['exhibition.description'].value.text
      }
      if (exhibition.data['exhibition.start_date']) {
        tempExhibition.start_date = exhibition.data['exhibition.start_date'].value
      }
      if (exhibition.data['exhibition.end_date']) {
        tempExhibition.end_date = exhibition.data['exhibition.end_date'].value
      }
      if (exhibition.data['exhibition.festival']) {
        tempExhibition.festival = exhibition.data['exhibition.festival'].value[0].text
      }
      if (exhibition.data['exhibition.venue']) {
        tempExhibition.location.venue = exhibition.data['exhibition.venue'].value[0].text
      }
      if (exhibition.data['exhibition.city']) {
        tempExhibition.location.city = exhibition.data['exhibition.city'].value[0].text
      }
      if (exhibition.data['exhibition.country']) {
        tempExhibition.location.country = exhibition.data['exhibition.country'].value[0].text
      }
      if (exhibition.data['exhibition.location']) {
        tempExhibition.location.geopoint = exhibition.data['exhibition.location'].value
      }
      tempExhibition.works = []
      if (exhibition.data['exhibition.works']) {
        exhibition.data['exhibition.works'].value.map(work => {
          if (work.work && work.work.value) {
            let matchingWork = data.transformed.works.find(
              e => e.id === work.work.value.document.id
            )
            if (matchingWork) {
              tempExhibition.works.push(matchingWork)
            }
          }
        })
      }
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
        spinner.stop()
        console.log('\n✓ All exhibitions processed'.green)
        data.transformed.works.map(e => delete e.id)
        data.transformed.content.map(e => delete e.id)
        delete data.transformed.files
        resolve(data)
      })
      .catch(reject)
  })
}

const addAbout = data => {
  // PROGRESS UPDATE
  const spinner = new Spinner('%s Adding about...'.yellow)
  spinner.start()
  // PROGRESS UPDATE
  return new Promise((resolve, reject) => {
    data.transformed.about = {}
    let about = data.find(post => post.type === 'about_page')
    data.transformed.about.info = about.data['about_text.info_text']
    data.transformed.about.tech = about.data['about_text.tech']
    data.transformed.about.credits = about.data['about_text.credits']
    spinner.stop()
    resolve(data)
  })
}

module.exports = data => {
  return new Promise((resolve, reject) => {
    data.transformed = {}
    transformFiles(data)
      .then(transformContent)
      .then(transformWorks)
      .then(transformExhibitions)
      .then(addAbout)
      .then(data => {
        resolve(data.transformed)
      })
      .catch(console.log)
  })
}
