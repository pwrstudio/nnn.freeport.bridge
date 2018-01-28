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

      // console.log(contentPost.data['content.hierarchy'])

      if (contentPost.data['content.hierarchy']) {
        // console.log('HIERARCHY'.green)
        // console.log('HIERARCHY'.green)
        // console.log('HIERARCHY'.green)
        // console.log('HIERARCHY'.green)
        // console.log(contentPost.data['content.hierarchy'].value)
        tempContent.hierarchy = contentPost.data['content.hierarchy'].value
      } else {
        tempContent.hierarchy = 'Documentation'
      }

      // console.log(tempContent.hierarchy)

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
          baseContent.hierarchy = tempContent.hierarchy
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
          baseContent.size = ipfs[0].size
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          if (contentPost.data['content.caption']) {
            baseContent.caption = PrismicDOM.RichText.asHtml(
              contentPost.data['content.caption'].value
            )
          }
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
        // Add audio file
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
        // Add audio poster image
        let posterURL = ''
        if (
          contentPost.data['content.audio_poster_image'] &&
          contentPost.data['content.audio_poster_image'].value &&
          contentPost.data['content.audio_poster_image'].value.main &&
          contentPost.data['content.audio_poster_image'].value.main.url
        ) {
          posterURL = contentPost.data['content.audio_poster_image'].value.main.url
        }
        let posterPromise = ipfs.addFile(posterURL)
        contentPromiseArray.push(posterPromise)

        Promise.all([audioPromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
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
          baseContent.size = ipfs[0].size
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
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
        // Add file poster image
        let posterURL = ''
        if (
          contentPost.data['content.file_poster_image'] &&
          contentPost.data['content.file_poster_image'].value &&
          contentPost.data['content.file_poster_image'].value.main &&
          contentPost.data['content.file_poster_image'].value.main.url
        ) {
          posterURL = contentPost.data['content.file_poster_image'].value.main.url
        }
        let posterPromise = ipfs.addFile(posterURL)
        contentPromiseArray.push(posterPromise)

        Promise.all([filePromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
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
          contentPost.data['content.external_link'].value.url
        ) {
          linkURL = contentPost.data['content.external_link'].value.url
        }
        var linkPromise = ipfs.addText(linkURL)
        contentPromiseArray.push(linkPromise)

        // Add link poster image
        let posterURL = ''
        if (
          contentPost.data['content.link_poster_image'] &&
          contentPost.data['content.link_poster_image'].value &&
          contentPost.data['content.link_poster_image'].value.main &&
          contentPost.data['content.link_poster_image'].value.main.url
        ) {
          posterURL = contentPost.data['content.link_poster_image'].value.main.url
        }
        let posterPromise = ipfs.addFile(posterURL)
        contentPromiseArray.push(posterPromise)

        Promise.all([linkPromise, posterPromise]).then(ipfs => {
          let baseContent = {}
          if (ipfs[0] && ipfs[0][0]) {
            baseContent.hash = ipfs[0][0].hash
            baseContent.size = ipfs[0][0].size
          }
          // Write poster image hash
          if (ipfs[1] && ipfs[1][0]) {
            baseContent.poster = ipfs[1][0].hash
          }
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
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
