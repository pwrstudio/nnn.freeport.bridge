var ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'})
const PrismicDOM = require('prismic-dom')
const toMarkdown = require('to-markdown')
const request = require('request').defaults({encoding: null})
const colors = require('colors')
const Spinner = require('cli-spinner').Spinner
var log = require('single-line-log').stdout

const idSort = (a, b) => {
  if (a.id < b.id) {
    return -1
  }
  if (a.id > b.id) {
    return 1
  }
  return 0
}

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
    if (!url) {
      console.log('empty')
      console.log('url', url)
      url = 'http://via.placeholder.com/350x150'
    }
    request
      .get(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          ipfs
            .add(Buffer.from(body))
            .then(resolve)
            .catch(reject)
        } else {
          console.log('request error:'.red, error)
        }
      })
      .on('error', err => {
        console.log('on error', err)
        reject(err)
      })
  })
}

const addAbout = data => {
  return new Promise((resolve, reject) => {
    // PROGRESS UPDATE
    console.log('– Adding about...'.yellow)
    // PROGRESS UPDATE
    data.transformed.about = {}
    let about = data.find(post => post.type === 'about_page')
    data.transformed.about.info = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.info_text'].value)
    )
    data.transformed.about.tech = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.tech'].value)
    )
    data.transformed.about.credits = toMarkdown(
      PrismicDOM.RichText.asHtml(about.data['about_page.credits'].value)
    )
    console.log('✓ About page added'.green)
    resolve(data)
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
      if (
        contentPost.data['content.title'] &&
        contentPost.data['content.title'].value[0] &&
        contentPost.data['content.title'].value[0].text
      ) {
        tempContent.title = contentPost.data['content.title'].value[0].text
      }
      if (
        contentPost.data['content.content_type'] &&
        contentPost.data['content.content_type'].value
      ) {
        tempContent.media = contentPost.data['content.content_type'].value
      }
      if (contentPost.id) {
        tempContent.id = contentPost.id
      }
      // TEXT
      // TEXT
      // TEXT
      if (tempContent.media === 'Text') {
        // PROGRESS UPDATE
        log('/ Text:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        let textContent = ''
        if (contentPost.data['content.text'] && contentPost.data['content.text'].value) {
          textContent = toMarkdown(
            PrismicDOM.RichText.asHtml(contentPost.data['content.text'].value)
          )
        }
        let textPromise = addText(textContent)
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
        textPromise.catch(err => {
          console.log('TEXT: Caught error:'.red, String(err).red)
        })
        // IMAGE
        // IMAGE
        // IMAGE
        // IMAGE
      } else if (tempContent.media === 'Image') {
        // PROGRESS UPDATE
        log('/ Image:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        // console.log(contentPost.data['content.title'])
        let imageURL = ''
        if (
          contentPost.data['content.image'] &&
          contentPost.data['content.image'].value &&
          contentPost.data['content.image'].value.main &&
          contentPost.data['content.image'].value.main.url
        ) {
          imageURL = contentPost.data['content.image'].value.main.url
        }
        let imagePromise = addFile(imageURL)
        contentPromiseArray.push(imagePromise)
        imagePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        imagePromise.catch(err => {
          console.log('IMAGE: Caught error:'.red, String(err).red)
        })
        // AUDIO
        // AUDIO
        // AUDIO
      } else if (tempContent.media === 'Audio') {
        // PROGRESS UPDATE
        log('/ Audio:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        let audioURL = ''
        if (
          contentPost.data['content.audio'] &&
          contentPost.data['content.audio'].value &&
          contentPost.data['content.audio'].value.file &&
          contentPost.data['content.audio'].value.file.url
        ) {
          audioURL = contentPost.data['content.audio'].value.file.url
        }
        let audioPromise = addFile(audioURL)
        contentPromiseArray.push(audioPromise)
        audioPromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        audioPromise.catch(err => {
          console.log('AUDIO: Caught error:'.red, String(err).red)
        })
        // VIDEO
        // VIDEO
        // VIDEO
      } else if (tempContent.media === 'Video') {
        // PROGRESS UPDATE
        log('/ Video:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        let videoURL = ''
        if (
          contentPost.data['content.video'] &&
          contentPost.data['content.video'].value &&
          contentPost.data['content.video'].value.file &&
          contentPost.data['content.video'].value.file.url
        ) {
          videoURL = contentPost.data['content.video'].value.file.url
        }
        let videoPromise = addFile(videoURL)
        contentPromiseArray.push(videoPromise)
        videoPromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        videoPromise.catch(err => {
          console.log('VIDEO: Caught error:'.red, String(err).red)
        })
        // FILE
        // FILE
        // FILE
      } else if (tempContent.media === 'File') {
        // PROGRESS UPDATE
        log('/ File:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        let fileURL = ''
        if (
          contentPost.data['content.file'] &&
          contentPost.data['content.file'].value &&
          contentPost.data['content.file'].value.file &&
          contentPost.data['content.file'].value.file.url
        ) {
          fileURL = contentPost.data['content.file'].value.file.url
        }
        let filePromise = addFile(fileURL)
        contentPromiseArray.push(filePromise)
        filePromise.then(ipfs => {
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        filePromise.catch(err => {
          console.log('FILE: Caught error:'.red, String(err).red)
        })
        // LINK
        // LINK
        // LINK
      } else if (tempContent.media === 'External link') {
        // PROGRESS UPDATE
        log('/ Link:'.cyan, tempContent.title)
        // PROGRESS UPDATE
        let linkURL = ''
        if (
          contentPost.data['content.external_link'] &&
          contentPost.data['content.external_link'].value &&
          contentPost.data['content.external_link'].value.file &&
          contentPost.data['content.external_link'].value.file.url
        ) {
          linkURL = addText(contentPost.data['content.external_link'].value.url)
        }
        let linkPromise = addText(linkURL)
        contentPromiseArray.push(linkPromise)
        linkPromise.then(ipfs => {
          tempContent.ipfs = ipfs
          let baseContent = {}
          baseContent.hash = ipfs[0].hash
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.id = tempContent.id
          data.transformed.files.push(baseContent)
        })
        linkPromise.catch(err => {
          console.log('LINK: Caught error:'.red, String(err).red)
        })
      }
    })
    Promise.all(contentPromiseArray)
      .then(() => {
        console.log('\n✓ All files processed'.green)
        resolve(data.sort(idSort))
      })
      .catch(err => {
        console.log('file promise rejection'.red, err)
        reject(err)
      })
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
      .catch(err => {
        console.log('content promise rejection'.red, err)
        reject(err)
      })
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
      if (work.data['work.description']) {
        tempWork.description = work.data['work.description'].value[0].text
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
        resolve(data.sort(idSort))
      })
      .catch(err => {
        console.log('work promise rejection'.red, err)
        reject(err)
      })
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
      exhibitionPromise
        .then(ipfs => {
          let baseExhibition = {}
          baseExhibition.hash = ipfs[0].hash
          data.transformed.exhibitions.push(baseExhibition)
        })
        .catch(reject)
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
      .catch(err => {
        console.log('exhibition promise rejection'.red, err)
        reject(err)
      })
  })
}

module.exports = data => {
  return new Promise((resolve, reject) => {
    data.transformed = {}
    addAbout(data)
      .then(transformFiles)
      .then(transformContent)
      .then(transformWorks)
      .then(transformExhibitions)
      .then(data => {
        resolve(data.transformed)
      })
      .catch(err => {
        console.log('main transform promise rejection'.red, err)
        reject(err)
      })
  })
}
