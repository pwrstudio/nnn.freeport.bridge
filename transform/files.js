const PrismicDOM = require('prismic-dom')
const toMarkdown = require('to-markdown')
const colors = require('colors')
const ipfs = require('../shared/ipfs.js')
const helpers = require('../shared/helpers.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('Transforming files...'.yellow)

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
        console.log('/ Text:'.cyan, tempContent.title)

        let textContent = ''

        if (contentPost.data['content.text'] && contentPost.data['content.text'].value) {
          textContent = toMarkdown(
            PrismicDOM.RichText.asHtml(contentPost.data['content.text'].value)
          )
        }
        let textPromise = ipfs.addText(textContent)
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
        console.log('/ Image:'.cyan, tempContent.title)

        let imageURL = ''
        if (
          contentPost.data['content.image'] &&
          contentPost.data['content.image'].value &&
          contentPost.data['content.image'].value.main &&
          contentPost.data['content.image'].value.main.url
        ) {
          imageURL = contentPost.data['content.image'].value.main.url
        }
        let imagePromise = ipfs.addFile(imageURL)
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
        console.log('/ Audio:'.cyan, tempContent.title)

        let audioURL = ''
        if (
          contentPost.data['content.audio'] &&
          contentPost.data['content.audio'].value &&
          contentPost.data['content.audio'].value.file &&
          contentPost.data['content.audio'].value.file.url
        ) {
          audioURL = contentPost.data['content.audio'].value.file.url
        }
        let audioPromise = ipfs.addFile(audioURL)
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
        console.log('/ Video:'.cyan, tempContent.title)

        let videoURL = ''
        if (
          contentPost.data['content.video'] &&
          contentPost.data['content.video'].value &&
          contentPost.data['content.video'].value.file &&
          contentPost.data['content.video'].value.file.url
        ) {
          videoURL = contentPost.data['content.video'].value.file.url
        }
        let videoPromise = ipfs.addFile(videoURL)
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
        console.log('/ File:'.cyan, tempContent.title)

        let fileURL = ''
        if (
          contentPost.data['content.file'] &&
          contentPost.data['content.file'].value &&
          contentPost.data['content.file'].value.file &&
          contentPost.data['content.file'].value.file.url
        ) {
          fileURL = contentPost.data['content.file'].value.file.url
        }
        let filePromise = ipfs.addFile(fileURL)
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
        console.log('/ Link:'.cyan, tempContent.title)

        let linkURL = ''
        if (
          contentPost.data['content.external_link'] &&
          contentPost.data['content.external_link'].value &&
          contentPost.data['content.external_link'].value.file &&
          contentPost.data['content.external_link'].value.file.url
        ) {
          linkURL = ipfs.addText(contentPost.data['content.external_link'].value.url)
        }
        let linkPromise = ipfs.addText(linkURL)
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
        resolve(data.sort(helpers.idSort))
      })
      .catch(err => {
        console.log('file promise rejection'.red, err)
        reject(err)
      })
  })
}
