const PrismicDOM = require('prismic-dom')
const ipfs = require('../shared/ipfs.js')
const helpers = require('../shared/helpers.js')

module.exports = data => {
  return new Promise((resolve, reject) => {
    console.log('Transforming files...')

    data.transformed.files = []

    let contentPromiseArray = []
    data.filter(post => post.type === 'content').map(contentPost => {
      let tempContent = {}

      if (contentPost.rawJSON.title) {
        tempContent.title = PrismicDOM.RichText.asText(contentPost.rawJSON.title)
      }

      if (contentPost.rawJSON.content_type) {
        tempContent.media = contentPost.rawJSON.content_type
      }

      if (contentPost.rawJSON.hierarchy) {
        tempContent.hierarchy = contentPost.rawJSON.hierarchy
      } else {
        tempContent.hierarchy = 'Documentation'
      }

      if (contentPost.id) {
        tempContent.id = contentPost.id
      }

      // TEXT
      // TEXT
      // TEXT
      if (tempContent.media === 'Text') {

        // Fill in content object
        let baseContent = {}
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.hash = ''
        baseContent.text = ''

        if (contentPost.rawJSON && contentPost.rawJSON.text) {
          baseContent.text = PrismicDOM.RichText.asHtml(contentPost.rawJSON.text, helpers.linkResolver)
        }

        // Add to queue
        contentPromiseArray.push(ipfs.queueText(baseContent))

        // IMAGE
        // IMAGE
        // IMAGE
        // IMAGE
      } else if (tempContent.media === 'Image') {

        let baseContent = {}
        baseContent.hash = ''
        baseContent.size = 0
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.url = ''

        // Caption
        if (contentPost.rawJSON.caption) {
          baseContent.caption = PrismicDOM.RichText.asHtml(
            contentPost.rawJSON.caption,
            helpers.LinkResolver
          )
        }

        if (contentPost.rawJSON.image) {
          baseContent.url = contentPost.rawJSON.image.url
        }

        // Queue file
        let imagePromise = ipfs.queueFile(baseContent)

        contentPromiseArray.push(imagePromise)

        // AUDIO
        // AUDIO
        // AUDIO
      } else if (tempContent.media === 'Audio') {

        // Fill in content object
        let baseContent = {}
        baseContent.hash = ''
        baseContent.size = 0
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.url = ''

        // Add audio file
        if (contentPost.rawJSON.audio && contentPost.rawJSON.audio.url) {
          baseContent.url = contentPost.rawJSON.audio.url
        }

        // Add audio poster image
        if (contentPost.rawJSON.audio_poster_image && contentPost.rawJSON.audio_poster_image.url) {
          baseContent.poster = contentPost.rawJSON.audio_poster_image.url
        }

        // Queue file
        let audioPromise = ipfs.queueFile(baseContent)

        contentPromiseArray.push(audioPromise)

        // VIDEO
        // VIDEO
        // VIDEO
      } else if (tempContent.media === 'Video') {

        let baseContent = {}
        baseContent.hash = ''
        baseContent.size = 0
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.url = ''

        if (contentPost.rawJSON.video && contentPost.rawJSON.video.url) {
          baseContent.url = contentPost.rawJSON.video.url
        }

        // Queue File
        let videoPromise = ipfs.queueFile(baseContent)

        contentPromiseArray.push(videoPromise)

        // FILE
        // FILE
        // FILE
      } else if (tempContent.media === 'File') {
        let baseContent = {}
        baseContent.hash = ''
        baseContent.size = 0
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.url = ''

        if (contentPost.rawJSON.file && contentPost.rawJSON.file.url) {
          baseContent.url = contentPost.rawJSON.file.url
        }

        // Add file poster image
        if (contentPost.rawJSON.video_poster_image && contentPost.rawJSON.video_poster_image.url) {
          baseContent.poster = contentPost.rawJSON.video_poster_image.url
        }

        // Queue file
        let filePromise = ipfs.queueFile(baseContent)

        contentPromiseArray.push(filePromise)

        // LINK
        // LINK
        // LINK
      } else if (tempContent.media === 'External link') {
        let baseContent = {}
        baseContent.hash = ''
        baseContent.size = 0
        baseContent.title = tempContent.title
        baseContent.media = tempContent.media
        baseContent.hierarchy = tempContent.hierarchy
        baseContent.id = tempContent.id
        baseContent.text = ''

        // Add link
        if (contentPost.rawJSON.external_link && contentPost.rawJSON.external_link.url) {
          baseContent.text = contentPost.rawJSON.external_link.url
        }

        // Add link poster image
        if (contentPost.rawJSON.link_poster_image && contentPost.rawJSON.link_poster_image.url) {
          baseContent.poster = contentPost.rawJSON.link_poster_image.url
        }

        // Queue file
        var linkPromise = ipfs.queueText(baseContent)

        contentPromiseArray.push(linkPromise)

      } else if (tempContent.media === 'Image set') {
        console.log('Image set')
        contentPost.rawJSON.image_set.forEach((i, index) => {

          // Pass on the correct order
          var baseContent = {}
          baseContent.order = index
          baseContent.title = tempContent.title
          baseContent.media = tempContent.media
          baseContent.hierarchy = tempContent.hierarchy
          baseContent.id = tempContent.id
          baseContent.caption = PrismicDOM.RichText.asHtml(i.caption1, helpers.linkResolver)
          if (i.image1) {
            baseContent.url = i.image1.url
          }

          // Queue file
          let imagePromise = ipfs.queueFile(baseContent)

          contentPromiseArray.push(imagePromise)

        })
      }
    })

    Promise.all(contentPromiseArray)
      .then(() => {
        ipfs.addFileQueue().then(fileArray => {
          console.log('\n✓ All files processed:', fileArray.length)

          data.transformed.files = fileArray

          resolve(data.sort(helpers.idSort))
        })
      })
      .catch(err => {
        console.log('file promise rejection', err)
        reject(err)
      })
  })
}
